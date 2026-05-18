import type { MetadataRoute } from "next";

import { getAllBlogPosts } from "@/lib/content/blog";
import { getAllHardwareProducts } from "@/lib/content/hardware";
import { getSiteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [products, blogPosts] = await Promise.all([
    getAllHardwareProducts(),
    getAllBlogPosts(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/hardware`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/hardware/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
