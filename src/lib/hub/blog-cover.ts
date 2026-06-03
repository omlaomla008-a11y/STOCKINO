import { absoluteUrl } from "@/lib/seo/site";

/** Retourne une URL d’image utilisable, ou null si le champ n’en est pas une (ex. titre collé par erreur). */
export function normalizeBlogCoverSrc(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith("/")) {
    return absoluteUrl(trimmed);
  }

  return null;
}
