/**
 * Liens d'affiliation Amazon.fr
 *
 * Définir sur Netlify / .env.local :
 *   AMAZON_ASSOCIATE_TAG=votretag-21
 * (identique à votre ID partenaire Amazon Associates)
 */

/** Tag partenaire Amazon (ex. stockino-21). */
export function getAmazonAssociateTag(): string | null {
  const tag =
    process.env.AMAZON_ASSOCIATE_TAG?.trim() ||
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim();
  return tag || null;
}

export function isAmazonUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes("amazon.") || host === "amzn.to" || host.endsWith(".amzn.to");
  } catch {
    return false;
  }
}

/**
 * Ajoute ou remplace le paramètre `tag` sur une URL Amazon.
 * Les URLs non-Amazon sont renvoyées telles quelles.
 */
export function buildAmazonAffiliateUrl(rawUrl: string, tagOverride?: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return trimmed;

  const tag = tagOverride ?? getAmazonAssociateTag();
  if (!tag || !isAmazonUrl(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    url.searchParams.set("tag", tag);
    return url.toString();
  } catch {
    return trimmed;
  }
}

/** Libellé du bouton d'achat par défaut */
export const DEFAULT_AMAZON_CTA = "Acheter sur Amazon.fr";
