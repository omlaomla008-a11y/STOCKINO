"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { buildAmazonAffiliateUrl } from "@/lib/affiliate/amazon";
import { requireHubStudio } from "@/lib/hub/studio-auth";
import { HARDWARE_CATEGORIES } from "@/types/hub";

export type HubActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (ex: mon-produit-2026)");

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

const hardwareSchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(200),
  category: z.enum(HARDWARE_CATEGORIES),
  image: z.string().min(1),
  shortDescription: z.string().min(10).max(500),
  specs: z.string(),
  pros: z.string(),
  cons: z.string(),
  useCases: z.string(),
  affiliateUrl: z.string().url(),
  affiliateLabel: z.string().min(2).max(80).default("Acheter sur Amazon.fr"),
  featured: z.coerce.boolean(),
  published: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

const blogSchema = z.object({
  slug: slugSchema,
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(500),
  content: z.string().min(20),
  category: z.string().max(100).optional(),
  tags: z.string().optional(),
  coverImage: z.string().optional(),
  relatedHardwareSlugs: z.string().optional(),
  published: z.coerce.boolean(),
  publishedAt: z.string().min(1),
});

function revalidateHub() {
  revalidatePath("/hardware");
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/studio");
  revalidatePath("/studio/hardware");
  revalidatePath("/studio/blog");
  revalidatePath("/sitemap.xml");
}

export async function uploadHubImageAction(
  formData: FormData,
): Promise<{ status: "success" | "error"; imageUrl?: string; message?: string }> {
  const { adminClient } = await requireHubStudio();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { status: "error", message: "Fichier image requis." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
  const path = `hub/${Date.now()}-${sanitizedName}`;
  const { error } = await adminClient.storage.from("product-images").upload(path, buffer, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  const { data } = adminClient.storage.from("product-images").getPublicUrl(path);
  return { status: "success", imageUrl: data.publicUrl };
}

export async function createHardwareAction(
  _prev: HubActionState,
  formData: FormData,
): Promise<HubActionState> {
  const { adminClient } = await requireHubStudio();

  const parsed = hardwareSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    category: formData.get("category"),
    image: formData.get("image"),
    shortDescription: formData.get("shortDescription"),
    specs: formData.get("specs"),
    pros: formData.get("pros"),
    cons: formData.get("cons"),
    useCases: formData.get("useCases"),
    affiliateUrl: formData.get("affiliateUrl"),
    affiliateLabel: formData.get("affiliateLabel") || "Acheter sur Amazon.fr",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sortOrder: formData.get("sortOrder") || "0",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const d = parsed.data;
  const { error } = await adminClient.from("hub_hardware_products").insert({
    slug: d.slug,
    name: d.name,
    category: d.category,
    image: d.image,
    short_description: d.shortDescription,
    specs: linesToArray(d.specs),
    pros: linesToArray(d.pros),
    cons: linesToArray(d.cons),
    use_cases: linesToArray(d.useCases),
    affiliate_url: buildAmazonAffiliateUrl(d.affiliateUrl),
    affiliate_label: d.affiliateLabel,
    featured: d.featured,
    published: d.published,
    sort_order: d.sortOrder,
  });

  if (error) {
    return {
      status: "error",
      message: error.message.includes("duplicate")
        ? "Ce slug existe déjà."
        : error.message,
    };
  }

  revalidateHub();
  revalidatePath(`/hardware/${d.slug}`);
  return { status: "success", message: "Produit créé avec lien affilié Amazon." };
}

export async function updateHardwareAction(
  _prev: HubActionState,
  formData: FormData,
): Promise<HubActionState> {
  const { adminClient } = await requireHubStudio();
  const id = formData.get("id") as string;
  if (!id) return { status: "error", message: "ID manquant." };

  const parsed = hardwareSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    category: formData.get("category"),
    image: formData.get("image"),
    shortDescription: formData.get("shortDescription"),
    specs: formData.get("specs"),
    pros: formData.get("pros"),
    cons: formData.get("cons"),
    useCases: formData.get("useCases"),
    affiliateUrl: formData.get("affiliateUrl"),
    affiliateLabel: formData.get("affiliateLabel") || "Acheter sur Amazon.fr",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sortOrder: formData.get("sortOrder") || "0",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const d = parsed.data;
  const { error } = await adminClient
    .from("hub_hardware_products")
    .update({
      slug: d.slug,
      name: d.name,
      category: d.category,
      image: d.image,
      short_description: d.shortDescription,
      specs: linesToArray(d.specs),
      pros: linesToArray(d.pros),
      cons: linesToArray(d.cons),
      use_cases: linesToArray(d.useCases),
      affiliate_url: buildAmazonAffiliateUrl(d.affiliateUrl),
      affiliate_label: d.affiliateLabel,
      featured: d.featured,
      published: d.published,
      sort_order: d.sortOrder,
    })
    .eq("id", id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidateHub();
  revalidatePath(`/hardware/${d.slug}`);
  return { status: "success", message: "Produit mis à jour avec lien affilié Amazon." };
}

export async function deleteHardwareAction(id: string): Promise<HubActionState> {
  const { adminClient } = await requireHubStudio();
  const { error } = await adminClient.from("hub_hardware_products").delete().eq("id", id);
  if (error) return { status: "error", message: error.message };
  revalidateHub();
  return { status: "success", message: "Produit supprimé." };
}

export async function createBlogPostAction(
  _prev: HubActionState,
  formData: FormData,
): Promise<HubActionState> {
  const { adminClient } = await requireHubStudio();

  const parsed = blogSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    content: formData.get("content"),
    category: formData.get("category") || undefined,
    tags: formData.get("tags"),
    coverImage: formData.get("coverImage") || undefined,
    relatedHardwareSlugs: formData.get("relatedHardwareSlugs"),
    published: formData.get("published") === "on",
    publishedAt: formData.get("publishedAt"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const d = parsed.data;
  const { error } = await adminClient.from("hub_blog_posts").insert({
    slug: d.slug,
    title: d.title,
    description: d.description,
    content: d.content,
    category: d.category || null,
    tags: d.tags ? linesToArray(d.tags) : [],
    cover_image: d.coverImage || null,
    related_hardware_slugs: d.relatedHardwareSlugs
      ? linesToArray(d.relatedHardwareSlugs.replace(/,/g, "\n"))
      : [],
    published: d.published,
    published_at: d.publishedAt,
  });

  if (error) {
    return {
      status: "error",
      message: error.message.includes("duplicate") ? "Ce slug existe déjà." : error.message,
    };
  }

  revalidateHub();
  revalidatePath(`/blog/${d.slug}`);
  return { status: "success", message: "Article créé." };
}

export async function updateBlogPostAction(
  _prev: HubActionState,
  formData: FormData,
): Promise<HubActionState> {
  const { adminClient } = await requireHubStudio();
  const id = formData.get("id") as string;
  if (!id) return { status: "error", message: "ID manquant." };

  const parsed = blogSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    content: formData.get("content"),
    category: formData.get("category") || undefined,
    tags: formData.get("tags"),
    coverImage: formData.get("coverImage") || undefined,
    relatedHardwareSlugs: formData.get("relatedHardwareSlugs"),
    published: formData.get("published") === "on",
    publishedAt: formData.get("publishedAt"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const d = parsed.data;
  const { error } = await adminClient
    .from("hub_blog_posts")
    .update({
      slug: d.slug,
      title: d.title,
      description: d.description,
      content: d.content,
      category: d.category || null,
      tags: d.tags ? linesToArray(d.tags) : [],
      cover_image: d.coverImage || null,
      related_hardware_slugs: d.relatedHardwareSlugs
        ? linesToArray(d.relatedHardwareSlugs.replace(/,/g, "\n"))
        : [],
      published: d.published,
      published_at: d.publishedAt,
    })
    .eq("id", id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidateHub();
  revalidatePath(`/blog/${d.slug}`);
  return { status: "success", message: "Article mis à jour." };
}

export async function deleteBlogPostAction(id: string): Promise<HubActionState> {
  const { adminClient } = await requireHubStudio();
  const { error } = await adminClient.from("hub_blog_posts").delete().eq("id", id);
  if (error) return { status: "error", message: error.message };
  revalidateHub();
  return { status: "success", message: "Article supprimé." };
}
