import { SITE_NAME, absoluteUrl, getDefaultOgImageUrl, getSiteUrl } from "@/lib/seo/site";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: getDefaultOgImageUrl(),
    description:
      "Gestion de stock pour professionnels et hub matériel (scanners, imprimantes d'étiquettes).",
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
