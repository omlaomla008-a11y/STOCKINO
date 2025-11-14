"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const saleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("La quantité doit être positive."),
  unitPrice: z.number().nonnegative("Le prix unitaire doit être positif ou nul."),
});

const createSaleSchema = z.object({
  organizationId: z.string().uuid(),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide."),
  items: z.array(saleItemSchema).min(1, "Au moins un produit est requis."),
  notes: z.string().optional().nullable(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;

export type CreateSaleResult =
  | {
      status: "success";
      sale: {
        id: string;
        organization_id: string;
        sale_date: string;
        total_amount: number;
        created_by: string;
        notes: string | null;
        created_at: string;
        updated_at: string;
      };
    }
  | {
      status: "error";
      message: string;
    };

export async function createSaleAction(
  input: CreateSaleInput,
): Promise<CreateSaleResult> {
  const user = await requireUser();
  const parsed = createSaleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Informations de vente invalides.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.organization_id) {
    return {
      status: "error",
      message: "Impossible de déterminer votre organisation.",
    };
  }

  if (profile.organization_id !== parsed.data.organizationId) {
    return {
      status: "error",
      message: "Vous ne pouvez créer des ventes que pour votre organisation.",
    };
  }

  // Vérifier que tous les produits existent et appartiennent à l'organisation
  const productIds = parsed.data.items.map((item) => item.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, quantity, price")
    .in("id", productIds)
    .eq("organization_id", parsed.data.organizationId);

  if (productsError || !products || products.length !== productIds.length) {
    return {
      status: "error",
      message: "Un ou plusieurs produits sont introuvables ou n'appartiennent pas à votre organisation.",
    };
  }

  // Vérifier les stocks disponibles
  for (const item of parsed.data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return {
        status: "error",
        message: `Produit introuvable: ${item.productId}`,
      };
    }
    if (product.quantity < item.quantity) {
      return {
        status: "error",
        message: `Stock insuffisant pour le produit. Stock disponible: ${product.quantity}`,
      };
    }
  }

  try {
    // Créer la vente
    const { data: newSale, error: saleError } = await supabase
      .from("sales")
      .insert({
        organization_id: parsed.data.organizationId,
        sale_date: parsed.data.saleDate,
        created_by: user.id,
        notes: parsed.data.notes ?? null,
        total_amount: 0, // Sera calculé automatiquement par le trigger
      })
      .select()
      .single();

    if (saleError || !newSale) {
      console.error(saleError);
      return {
        status: "error",
        message: "Impossible de créer la vente. Réessayez.",
      };
    }

    // Créer les lignes de vente et mettre à jour les stocks
    const salesItems = parsed.data.items.map((item) => ({
      sale_id: newSale.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabase
      .from("sales_items")
      .insert(salesItems);

    if (itemsError) {
      // Supprimer la vente si les items n'ont pas pu être créés
      await supabase.from("sales").delete().eq("id", newSale.id);
      console.error(itemsError);
      return {
        status: "error",
        message: "Impossible d'ajouter les produits à la vente. Réessayez.",
      };
    }

    // Mettre à jour les stocks des produits
    for (const item of parsed.data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const newQuantity = product.quantity - item.quantity;
        const newStatus =
          newQuantity === 0
            ? "out_of_stock"
            : newQuantity < 10
              ? "low_stock"
              : "in_stock";

        await supabase
          .from("products")
          .update({
            quantity: newQuantity,
            status: newStatus,
          })
          .eq("id", item.productId);
      }
    }

    // Récupérer la vente avec le total calculé
    const { data: saleWithTotal, error: fetchError } = await supabase
      .from("sales")
      .select("*")
      .eq("id", newSale.id)
      .single();

    if (fetchError || !saleWithTotal) {
      return {
        status: "error",
        message: "Vente créée mais impossible de récupérer les détails.",
      };
    }

    revalidatePath("/sales");
    revalidatePath("/dashboard");
    revalidatePath("/products");

    return {
      status: "success",
      sale: saleWithTotal,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Une erreur inattendue s'est produite. Réessayez.",
    };
  }
}

const deleteSaleSchema = z.object({
  saleId: z.string().uuid(),
});

export type DeleteSaleResult =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function deleteSaleAction(
  input: z.infer<typeof deleteSaleSchema>,
): Promise<DeleteSaleResult> {
  const user = await requireUser();
  const parsed = deleteSaleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID de vente invalide.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.organization_id) {
    return {
      status: "error",
      message: "Impossible de déterminer votre organisation.",
    };
  }

  // Récupérer la vente et ses items
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("id, organization_id")
    .eq("id", parsed.data.saleId)
    .single();

  if (saleError || !sale) {
    return {
      status: "error",
      message: "Vente introuvable.",
    };
  }

  if (sale.organization_id !== profile.organization_id) {
    return {
      status: "error",
      message: "Vous ne pouvez supprimer que les ventes de votre organisation.",
    };
  }

  // Récupérer les items pour restaurer les stocks
  const { data: items, error: itemsError } = await supabase
    .from("sales_items")
    .select("product_id, quantity")
    .eq("sale_id", parsed.data.saleId);

  if (itemsError) {
    console.error(itemsError);
  }

  // Restaurer les stocks si des items existent
  if (items && items.length > 0) {
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("quantity, status")
        .eq("id", item.product_id)
        .single();

      if (product) {
        const newQuantity = product.quantity + item.quantity;
        const newStatus =
          newQuantity === 0
            ? "out_of_stock"
            : newQuantity < 10
              ? "low_stock"
              : "in_stock";

        await supabase
          .from("products")
          .update({
            quantity: newQuantity,
            status: newStatus,
          })
          .eq("id", item.product_id);
      }
    }
  }

  // Supprimer la vente (les items seront supprimés automatiquement par CASCADE)
  const { error: deleteError } = await supabase
    .from("sales")
    .delete()
    .eq("id", parsed.data.saleId);

  if (deleteError) {
    console.error(deleteError);
    return {
      status: "error",
      message: "Impossible de supprimer la vente. Réessayez.",
    };
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/products");

  return {
    status: "success",
    message: "Vente supprimée avec succès. Les stocks ont été restaurés.",
  };
}

