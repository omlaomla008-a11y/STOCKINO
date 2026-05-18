/** URL canonique du site (production). */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "https://stockino.space";
}

export const SITE_NAME = "STOCKINO";

export const DEFAULT_OG_IMAGE_PATH = "/og-stockino.svg";

export const DEFAULT_KEYWORDS = [
  "gestion de stock",
  "inventaire PME",
  "scanner code-barres",
  "imprimante étiquettes",
  "logistique",
  "Stockino",
  "Maroc",
  "France",
] as const;

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getDefaultOgImageUrl(): string {
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
}
