import type { Metadata } from "next";

import {
  DEFAULT_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  getDefaultOgImageUrl,
  getSiteUrl,
} from "@/lib/seo/site";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string | null;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
};

/** Métadonnées SEO cohérentes pour les pages publiques du Tech Hub. */
export function buildPublicMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    path = "/",
    keywords = [...DEFAULT_KEYWORDS],
    ogImage,
    ogType = "website",
    publishedTime,
    modifiedTime,
    noIndex = false,
  } = options;

  const canonical = absoluteUrl(path);
  const image = ogImage ?? getDefaultOgImageUrl();

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: ogType,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
