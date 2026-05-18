import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stockino.space";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/hardware", "/hardware/", "/blog", "/blog/"],
      disallow: [
        "/dashboard",
        "/products",
        "/sales",
        "/movements",
        "/reports",
        "/users",
        "/settings",
        "/admin",
        "/studio",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
