import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { mapBlogRow, mapBlogRowToMeta, mapHardwareRow } from "@/lib/hub/mappers";
import type { HubBlogRow, HubHardwareRow } from "@/lib/hub/db-types";
import type { BlogPost, BlogPostMeta, HardwareProduct } from "@/types/hub";

import { getAllHardwareProductsFromFiles } from "@/lib/content/hardware-files";
import { getAllBlogPostsFromFiles, getBlogPostBySlugFromFiles } from "@/lib/content/blog-files";

function tableMissing(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.message?.includes("hub_hardware") === true ||
    error.message?.includes("hub_blog") === true ||
    error.message?.includes("does not exist") === true
  );
}

async function fetchHardwareRows(includeUnpublished: boolean): Promise<HubHardwareRow[]> {
  const client = getSupabaseAdminClient();
  let query = client.from("hub_hardware_products").select("*");
  if (!includeUnpublished) {
    query = query.eq("published", true);
  }
  const { data, error } = await query.order("featured", { ascending: false }).order("sort_order");
  if (tableMissing(error)) return [];
  if (error) {
    console.error("hub_hardware_products:", error);
    return [];
  }
  return (data ?? []) as HubHardwareRow[];
}

async function fetchBlogRows(includeUnpublished: boolean): Promise<HubBlogRow[]> {
  const client = getSupabaseAdminClient();
  let query = client.from("hub_blog_posts").select("*");
  if (!includeUnpublished) {
    query = query.eq("published", true);
  }
  const { data, error } = await query.order("published_at", { ascending: false });
  if (tableMissing(error)) return [];
  if (error) {
    console.error("hub_blog_posts:", error);
    return [];
  }
  return (data ?? []) as HubBlogRow[];
}

function mergeHardware(db: HardwareProduct[], files: HardwareProduct[]): HardwareProduct[] {
  const bySlug = new Map<string, HardwareProduct>();
  for (const item of files) bySlug.set(item.slug, item);
  for (const item of db) bySlug.set(item.slug, item);
  return Array.from(bySlug.values()).sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.name.localeCompare(b.name, "fr");
  });
}

function mergeBlogMeta(db: BlogPostMeta[], files: BlogPostMeta[]): BlogPostMeta[] {
  const bySlug = new Map<string, BlogPostMeta>();
  for (const item of files) bySlug.set(item.slug, item);
  for (const item of db) bySlug.set(item.slug, item);
  return Array.from(bySlug.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getAllHardwareProducts(): Promise<HardwareProduct[]> {
  const rows = await fetchHardwareRows(false);
  const fromDb = rows.map(mapHardwareRow);
  const fromFiles = await getAllHardwareProductsFromFiles();
  return mergeHardware(fromDb, fromFiles);
}

export async function getHardwareProductBySlug(slug: string): Promise<HardwareProduct | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("hub_hardware_products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (data && !error) {
    return mapHardwareRow(data as HubHardwareRow);
  }

  const all = await getAllHardwareProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const rows = await fetchBlogRows(false);
  const fromDb = rows.map(mapBlogRowToMeta);
  const fromFiles = await getAllBlogPostsFromFiles();
  return mergeBlogMeta(fromDb, fromFiles);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("hub_blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (data && !error) {
    return mapBlogRow(data as HubBlogRow);
  }

  return getBlogPostBySlugFromFiles(slug);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return posts.map((p) => p.slug);
}

export async function getAllHardwareForAdmin(): Promise<HubHardwareRow[]> {
  return fetchHardwareRows(true);
}

export async function getHardwareByIdForAdmin(id: string): Promise<HubHardwareRow | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client.from("hub_hardware_products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as HubHardwareRow;
}

export async function getAllBlogForAdmin(): Promise<HubBlogRow[]> {
  return fetchBlogRows(true);
}

export async function getBlogByIdForAdmin(id: string): Promise<HubBlogRow | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client.from("hub_blog_posts").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as HubBlogRow;
}
