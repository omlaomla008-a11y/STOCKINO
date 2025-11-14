"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const receiptItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("La quantité doit être positive."),
  unitPrice: z.number().nonnegative("Le prix unitaire doit être positif ou nul.").default(0),
});

const createReceiptSchema = z.object({
  organizationId: z.string().uuid(),
  type: z.enum(["entry", "exit"]),
  receiptDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide."),
  items: z.array(receiptItemSchema).min(1, "Au moins un produit est requis."),
  notes: z.string().optional().nullable(),
  vatRate: z.number().min(0).max(100).default(20),
  isInvoice: z.boolean().default(false),
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type ReceiptItemInput = z.infer<typeof receiptItemSchema>;

export type CreateReceiptResult =
  | {
      status: "success";
      receipt: {
        id: string;
        organization_id: string;
        reference: string;
        type: string;
        receipt_date: string;
        created_by: string;
        status: string;
        notes: string | null;
        created_at: string;
        updated_at: string;
      };
    }
  | {
      status: "error";
      message: string;
    };

export async function createReceiptAction(
  input: CreateReceiptInput,
): Promise<CreateReceiptResult> {
  const user = await requireUser();
  const parsed = createReceiptSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Informations de bon invalides.",
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
      message: "Vous ne pouvez créer des bons que pour votre organisation.",
    };
  }

  // Vérifier que tous les produits existent et appartiennent à l'organisation
  const productIds = parsed.data.items.map((item) => item.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, quantity")
    .in("id", productIds)
    .eq("organization_id", parsed.data.organizationId);

  if (productsError || !products || products.length !== productIds.length) {
    return {
      status: "error",
      message: "Un ou plusieurs produits sont introuvables ou n'appartiennent pas à votre organisation.",
    };
  }

  // Pour les sorties, vérifier les stocks disponibles
  if (parsed.data.type === "exit") {
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
          message: `Stock insuffisant pour un produit. Stock disponible: ${product.quantity}`,
        };
      }
    }
  }

  try {
    // Calculer les montants
    const subtotal = parsed.data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatAmount = (subtotal * parsed.data.vatRate) / 100;
    const totalAmount = subtotal + vatAmount;

    // Générer le numéro de facture si nécessaire
    let invoiceNumber: string | null = null;
    if (parsed.data.isInvoice) {
      const { data: invoiceData, error: invoiceError } = await supabase.rpc("generate_invoice_number", {
        org_id: parsed.data.organizationId,
      });

      if (invoiceError) {
        // Fallback : générer manuellement
        const year = new Date(parsed.data.receiptDate).getFullYear();
        const { count } = await supabase
          .from("receipts")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", parsed.data.organizationId)
          .like("invoice_number", `FAC-${year}-%`);

        const sequence = ((count ?? 0) + 1).toString().padStart(4, "0");
        invoiceNumber = `FAC-${year}-${sequence}`;
      } else {
        invoiceNumber = invoiceData as string;
      }
    }

    // Générer la référence via une fonction SQL
    const { data: refData, error: refError } = await supabase.rpc("generate_receipt_reference", {
      receipt_type: parsed.data.type,
    });

    if (refError) {
      // Fallback : générer manuellement si la fonction n'existe pas
      const prefix = parsed.data.type === "entry" ? "ENT" : "SOR";
      const year = new Date(parsed.data.receiptDate).getFullYear();
      const { count } = await supabase
        .from("receipts")
        .select("*", { count: "exact", head: true })
        .eq("type", parsed.data.type)
        .like("reference", `${prefix}-${year}-%`);

      const sequence = ((count ?? 0) + 1).toString().padStart(4, "0");
      const reference = `${prefix}-${year}-${sequence}`;

      // Créer le bon
      const { data: newReceipt, error: receiptError } = await supabase
        .from("receipts")
        .insert({
          organization_id: parsed.data.organizationId,
          reference,
          type: parsed.data.type,
          receipt_date: parsed.data.receiptDate,
          created_by: user.id,
          status: "completed",
          notes: parsed.data.notes ?? null,
          vat_rate: parsed.data.vatRate,
          subtotal,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          is_invoice: parsed.data.isInvoice,
          invoice_number: invoiceNumber,
        })
        .select()
        .single();

      if (receiptError || !newReceipt) {
        console.error(receiptError);
        return {
          status: "error",
          message: "Impossible de créer le bon. Réessayez.",
        };
      }

      // Créer les lignes de bon
      const receiptItems = parsed.data.items.map((item) => ({
        receipt_id: newReceipt.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from("receipt_items")
        .insert(receiptItems);

      if (itemsError) {
        await supabase.from("receipts").delete().eq("id", newReceipt.id);
        console.error(itemsError);
        return {
          status: "error",
          message: "Impossible d'ajouter les produits au bon. Réessayez.",
        };
      }

      // Mettre à jour les stocks manuellement si les triggers ne fonctionnent pas
      for (const item of parsed.data.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const newQuantity =
            parsed.data.type === "entry"
              ? product.quantity + item.quantity
              : product.quantity - item.quantity;

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

      revalidatePath("/movements");
      revalidatePath("/dashboard");
      revalidatePath("/products");

      return {
        status: "success",
        receipt: newReceipt,
      };
    }

    // Si la fonction RPC existe, l'utiliser
    const reference = refData as string;

    const { data: newReceipt, error: receiptError } = await supabase
      .from("receipts")
      .insert({
        organization_id: parsed.data.organizationId,
        reference,
        type: parsed.data.type,
        receipt_date: parsed.data.receiptDate,
        created_by: user.id,
        status: "completed",
        notes: parsed.data.notes ?? null,
        vat_rate: parsed.data.vatRate,
        subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        is_invoice: parsed.data.isInvoice,
        invoice_number: invoiceNumber,
      })
      .select()
      .single();

    if (receiptError || !newReceipt) {
      console.error(receiptError);
      return {
        status: "error",
        message: "Impossible de créer le bon. Réessayez.",
      };
    }

    // Créer les lignes de bon
    const receiptItems = parsed.data.items.map((item) => ({
      receipt_id: newReceipt.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabase
      .from("receipt_items")
      .insert(receiptItems);

    if (itemsError) {
      await supabase.from("receipts").delete().eq("id", newReceipt.id);
      console.error(itemsError);
      return {
        status: "error",
        message: "Impossible d'ajouter les produits au bon. Réessayez.",
      };
    }

    revalidatePath("/movements");
    revalidatePath("/dashboard");
    revalidatePath("/products");

    return {
      status: "success",
      receipt: newReceipt,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Une erreur inattendue s'est produite. Réessayez.",
    };
  }
}

const deleteReceiptSchema = z.object({
  receiptId: z.string().uuid(),
});

export type DeleteReceiptResult =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function deleteReceiptAction(
  input: z.infer<typeof deleteReceiptSchema>,
): Promise<DeleteReceiptResult> {
  const user = await requireUser();
  const parsed = deleteReceiptSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID de bon invalide.",
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

  // Récupérer le bon et ses items
  const { data: receipt, error: receiptError } = await supabase
    .from("receipts")
    .select("id, organization_id, type, status")
    .eq("id", parsed.data.receiptId)
    .single();

  if (receiptError || !receipt) {
    return {
      status: "error",
      message: "Bon introuvable.",
    };
  }

  if (receipt.organization_id !== profile.organization_id) {
    return {
      status: "error",
      message: "Vous ne pouvez supprimer que les bons de votre organisation.",
    };
  }

  // Récupérer les items pour restaurer les stocks si nécessaire
  const { data: items, error: itemsError } = await supabase
    .from("receipt_items")
    .select("product_id, quantity")
    .eq("receipt_id", parsed.data.receiptId);

  if (itemsError) {
    console.error(itemsError);
  }

  // Restaurer les stocks si le bon était complété (les triggers le feront automatiquement, mais on le fait aussi manuellement pour être sûr)
  if (receipt.status === "completed" && items && items.length > 0) {
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("quantity, status")
        .eq("id", item.product_id)
        .single();

      if (product) {
        const newQuantity =
          receipt.type === "entry"
            ? product.quantity - item.quantity // Entrée supprimée : diminuer
            : product.quantity + item.quantity; // Sortie supprimée : augmenter

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

  // Supprimer le bon (les items seront supprimés automatiquement par CASCADE)
  const { error: deleteError } = await supabase
    .from("receipts")
    .delete()
    .eq("id", parsed.data.receiptId);

  if (deleteError) {
    console.error(deleteError);
    return {
      status: "error",
      message: "Impossible de supprimer le bon. Réessayez.",
    };
  }

  revalidatePath("/movements");
  revalidatePath("/dashboard");
  revalidatePath("/products");

  return {
    status: "success",
    message: "Bon supprimé avec succès. Les stocks ont été restaurés.",
  };
}

