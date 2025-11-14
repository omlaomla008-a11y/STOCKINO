"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { PRODUCT_STATUSES } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

// Action serveur pour uploader une image
export async function uploadProductImageAction(
  formData: FormData,
): Promise<{ status: "success" | "error"; imageUrl?: string | null; message?: string }> {
  const user = await requireUser();
  const file = formData.get("file") as File | null;
  const organizationId = formData.get("organizationId") as string | null;

  if (!file || !organizationId) {
    return {
      status: "error",
      message: "Fichier ou organisation manquant.",
    };
  }

  // Vérifier que l'utilisateur appartient à l'organisation
  const adminClient = getSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.organization_id !== organizationId) {
    return {
      status: "error",
      message: "Vous n'avez pas le droit d'uploader des images pour cette organisation.",
    };
  }

  // Convertir File en ArrayBuffer puis en Blob
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
  const path = `${organizationId}/${Date.now()}-${sanitizedName}`;

  // Utiliser le client admin pour uploader (bypass RLS)
  try {
    // Le client admin avec service role bypass complètement RLS
    const adminClient = getSupabaseAdminClient();

    const { error: uploadError } = await adminClient.storage
      .from("product-images")
      .upload(path, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Erreur upload:", uploadError);
      
      // Si le bucket n'existe pas, donner un message clair
      if (
        uploadError.message?.includes("Bucket not found") ||
        uploadError.message?.includes("does not exist") ||
        uploadError.message?.includes("Bucket")
      ) {
        return {
          status: "error",
          message: "Le bucket 'product-images' n'existe pas dans Supabase Storage. Veuillez le créer dans l'interface Supabase.",
        };
      }

      return {
        status: "error",
        message: `Impossible de téléverser l'image: ${uploadError.message ?? "Erreur inconnue"}`,
      };
    }

    const { data } = adminClient.storage.from("product-images").getPublicUrl(path);

    return {
      status: "success",
      imageUrl: data?.publicUrl ?? null,
    };
  } catch (error) {
    console.error("Erreur upload:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erreur lors du téléversement de l'image.",
    };
  }
}

const createProductSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1, "Le nom du produit est requis."),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(PRODUCT_STATUSES).default("in_stock"),
  stock: z.number().int().nonnegative(),
  price: z.number().nonnegative().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type CreateProductResult =
  | {
      status: "success";
      product: {
        id: string;
        organization_id: string;
        name: string;
        category: string | null;
        description: string | null;
        status: string;
        quantity: number;
        price: number | null;
        image_url: string | null;
        created_at: string;
        updated_at: string;
      };
    }
  | {
      status: "error";
      message: string;
    };

export async function createProductAction(input: CreateProductInput): Promise<CreateProductResult> {
  const user = await requireUser();
  const parsed = createProductSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Informations produit invalides.",
    };
  }

  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser RLS
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.organization_id) {
    return {
      status: "error",
      message: "Impossible de déterminer votre organisation.",
    };
  }

  if (profile.organization_id !== parsed.data.organizationId) {
    return {
      status: "error",
      message: "Vous ne pouvez créer des produits que pour votre organisation.",
    };
  }

  // Utiliser le client admin pour l'insertion
  const { data, error } = await adminClient
    .from("products")
    .insert({
      organization_id: parsed.data.organizationId,
      name: parsed.data.name,
      category: parsed.data.category ?? null,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      quantity: parsed.data.stock,
      price: parsed.data.price ?? null,
      image_url: parsed.data.imageUrl ?? null,
    })
    .select("id, organization_id, name, category, description, status, quantity, price, image_url, created_at, updated_at")
    .single();

  if (error || !data) {
    console.error(error);
    return {
      status: "error",
      message: "Impossible d’enregistrer le produit. Réessayez.",
    };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");

  return {
    status: "success",
    product: data,
  };
}

const updateProductSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1, "Le nom du produit est requis."),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(PRODUCT_STATUSES).default("in_stock"),
  stock: z.number().int().nonnegative(),
  price: z.number().nonnegative().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type UpdateProductResult =
  | {
      status: "success";
      product: {
        id: string;
        organization_id: string;
        name: string;
        category: string | null;
        description: string | null;
        status: string;
        quantity: number;
        price: number | null;
        image_url: string | null;
        created_at: string;
        updated_at: string;
      };
    }
  | {
      status: "error";
      message: string;
    };

export async function updateProductAction(
  input: UpdateProductInput,
): Promise<UpdateProductResult> {
  const user = await requireUser();
  const parsed = updateProductSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Informations produit invalides.",
    };
  }

  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser RLS
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.organization_id) {
    return {
      status: "error",
      message: "Impossible de déterminer votre organisation.",
    };
  }

  // Vérifier que le produit appartient à l'organisation
  const { data: existingProduct, error: fetchError } = await adminClient
    .from("products")
    .select("organization_id")
    .eq("id", parsed.data.productId)
    .single();

  if (fetchError || !existingProduct) {
    return {
      status: "error",
      message: "Produit introuvable.",
    };
  }

  if (existingProduct.organization_id !== profile.organization_id) {
    return {
      status: "error",
      message: "Vous ne pouvez modifier que les produits de votre organisation.",
    };
  }

  // Utiliser le client admin pour la mise à jour
  const { data, error } = await adminClient
    .from("products")
    .update({
      name: parsed.data.name.trim(),
      category: parsed.data.category?.trim() || null,
      description: parsed.data.description?.trim() || null,
      status: parsed.data.status,
      quantity: parsed.data.stock,
      price: parsed.data.price ?? null,
      image_url: parsed.data.imageUrl ?? null,
    })
    .eq("id", parsed.data.productId)
    .select("id, organization_id, name, category, description, status, quantity, price, image_url, created_at, updated_at")
    .single();

  if (error || !data) {
    console.error(error);
    return {
      status: "error",
      message: "Impossible de mettre à jour le produit. Réessayez.",
    };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");

  return {
    status: "success",
    product: data,
  };
}

const deleteProductSchema = z.object({
  productId: z.string().uuid(),
});

export type DeleteProductResult =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function deleteProductAction(
  input: z.infer<typeof deleteProductSchema>,
): Promise<DeleteProductResult> {
  const user = await requireUser();
  const parsed = deleteProductSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID de produit invalide.",
    };
  }

  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser RLS
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.organization_id) {
    return {
      status: "error",
      message: "Impossible de déterminer votre organisation.",
    };
  }

  // Vérifier que le produit appartient à l'organisation
  const { data: existingProduct, error: fetchError } = await adminClient
    .from("products")
    .select("organization_id, image_url")
    .eq("id", parsed.data.productId)
    .single();

  if (fetchError || !existingProduct) {
    return {
      status: "error",
      message: "Produit introuvable.",
    };
  }

  if (existingProduct.organization_id !== profile.organization_id) {
    return {
      status: "error",
      message: "Vous ne pouvez supprimer que les produits de votre organisation.",
    };
  }

  // Supprimer l'image du storage si elle existe (utiliser le client admin pour bypass RLS)
  if (existingProduct.image_url) {
    try {
      const urlParts = existingProduct.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const path = `${profile.organization_id}/${fileName}`;

      await adminClient.storage.from("product-images").remove([path]);
    } catch (storageError) {
      console.warn("Impossible de supprimer l'image du storage:", storageError);
      // On continue quand même la suppression du produit
    }
  }

  // Utiliser le client admin pour la suppression
  const { error: deleteError } = await adminClient
    .from("products")
    .delete()
    .eq("id", parsed.data.productId);

  if (deleteError) {
    console.error(deleteError);
    return {
      status: "error",
      message: "Impossible de supprimer le produit. Réessayez.",
    };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Produit supprimé avec succès.",
  };
}

