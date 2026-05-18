import type { HubBlogRow, HubHardwareRow } from "@/lib/hub/db-types";
import type { BlogPost, BlogPostMeta, HardwareProduct } from "@/types/hub";

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  return [];
}

export function mapHardwareRow(row: HubHardwareRow): HardwareProduct {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    image: row.image,
    shortDescription: row.short_description,
    specs: parseStringArray(row.specs),
    pros: parseStringArray(row.pros),
    cons: parseStringArray(row.cons),
    useCases: parseStringArray(row.use_cases),
    affiliateUrl: row.affiliate_url,
    affiliateLabel: row.affiliate_label,
    featured: row.featured,
  };
}

export function mapBlogRowToMeta(row: HubBlogRow): BlogPostMeta {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishedAt: row.published_at,
    updatedAt: row.updated_at.split("T")[0],
    category: row.category ?? undefined,
    tags: parseStringArray(row.tags),
    coverImage: row.cover_image ?? undefined,
    relatedHardwareSlugs: parseStringArray(row.related_hardware_slugs),
  };
}

export function mapBlogRow(row: HubBlogRow): BlogPost {
  return {
    ...mapBlogRowToMeta(row),
    content: row.content,
  };
}

export type HubHardwareAdmin = HubHardwareRow;
export type HubBlogAdmin = HubBlogRow;
