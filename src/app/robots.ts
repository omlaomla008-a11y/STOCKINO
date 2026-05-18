import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo/site";

const BASE_URL = getSiteUrl();

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
