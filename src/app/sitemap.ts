import type { MetadataRoute } from "next";

import { getAllBlogSlugs } from "@/lib/content/blog";
import { getAllHardwareProducts } from "@/lib/content/hardware";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stockino.space";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogSlugs] = await Promise.all([
    getAllHardwareProducts(),
    getAllBlogSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/hardware`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/signin`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/signup`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/hardware/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
