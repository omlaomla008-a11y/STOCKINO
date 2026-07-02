const PUB_ID_PATTERN = /^(?:ca-)?pub-(\d+)$/i;

function parsePublisherId(raw: string | undefined): string | null {
  const id = raw?.trim();
  if (!id) return null;
  const m = id.match(PUB_ID_PATTERN);
  if (!m) return null;
  return m[1];
}

/** ID pour le script AdSense (format `ca-pub-…`). */
export function getAdSenseClientId(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_ADSENSE_CLIENT_ID?.trim();
  const digits = parsePublisherId(raw);
  if (!digits) return null;
  return `ca-pub-${digits}`;
}

/** ID pour ads.txt (format `pub-…` sans le préfixe `ca-`). */
export function getAdSenseAdsTxtPublisherId(): string | null {
  const digits = parsePublisherId(
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ||
      process.env.GOOGLE_ADSENSE_CLIENT_ID?.trim(),
  );
  if (!digits) return null;
  return `pub-${digits}`;
}

/** Emplacement display (optionnel) pour les articles de blog. */
export function getAdSenseBlogSlotId(): string | null {
  const slot = process.env.NEXT_PUBLIC_ADSENSE_BLOG_SLOT?.trim();
  return slot || null;
}

export function isAdSenseConfigured(): boolean {
  return getAdSenseClientId() !== null;
}
