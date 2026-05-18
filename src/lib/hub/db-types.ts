import type { HardwareCategory } from "@/types/hub";

export type HubHardwareRow = {
  id: string;
  slug: string;
  name: string;
  category: HardwareCategory;
  image: string;
  short_description: string;
  specs: string[];
  pros: string[];
  cons: string[];
  use_cases: string[];
  affiliate_url: string;
  affiliate_label: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type HubBlogRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string | null;
  tags: string[];
  cover_image: string | null;
  related_hardware_slugs: string[];
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};
