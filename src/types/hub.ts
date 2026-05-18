export const HARDWARE_CATEGORIES = [
  "scanners",
  "imprimantes",
  "consommables",
  "terminaux",
] as const;

export type HardwareCategory = (typeof HARDWARE_CATEGORIES)[number];

export type HardwareProduct = {
  slug: string;
  name: string;
  category: HardwareCategory;
  image: string;
  shortDescription: string;
  specs: string[];
  pros: string[];
  cons: string[];
  useCases: string[];
  affiliateUrl: string;
  affiliateLabel?: string;
  featured?: boolean;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  relatedHardwareSlugs?: string[];
};

export type BlogPost = BlogPostMeta & {
  content: string;
};
