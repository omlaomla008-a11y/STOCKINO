import type { BlogPostMeta } from "@/types/hub";

/** Catégories d’articles « guide / vente » : mentions Amazon affichées en bas d’article. */
export const AFFILIATE_BLOG_CATEGORIES = ["Guides d'achat", "Matériel recommandé"] as const;

export type AffiliateBlogCategory = (typeof AFFILIATE_BLOG_CATEGORIES)[number];

function normalizeCategory(category: string | null | undefined): string {
  return category?.trim().toLowerCase() ?? "";
}

/**
 * Affiche le bloc Amazon + mention Partenaire Amazon uniquement pour les guides d’achat
 * ou les articles liés à des fiches matériel.
 */
export function shouldShowBlogAffiliateBlocks(
  post: Pick<BlogPostMeta, "category" | "relatedHardwareSlugs">,
): boolean {
  const cat = normalizeCategory(post.category);
  if (
    AFFILIATE_BLOG_CATEGORIES.some((label) => normalizeCategory(label) === cat)
  ) {
    return true;
  }
  return (post.relatedHardwareSlugs?.length ?? 0) > 0;
}
