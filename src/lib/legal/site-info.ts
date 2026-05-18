import { getSiteUrl, SITE_NAME } from "@/lib/seo/site";

/** Informations légales configurables via variables d'environnement (Netlify). */
export function getLegalSiteInfo() {
  const siteUrl = getSiteUrl();
  return {
    siteName: SITE_NAME,
    siteUrl,
    publisherName: process.env.NEXT_PUBLIC_SITE_PUBLISHER_NAME?.trim() || "Stockino",
    legalForm: process.env.NEXT_PUBLIC_SITE_LEGAL_FORM?.trim() || "",
    address: process.env.NEXT_PUBLIC_SITE_PUBLISHER_ADDRESS?.trim() || "",
    siret: process.env.NEXT_PUBLIC_SITE_SIRET?.trim() || "",
    contactEmail:
      process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL?.trim() || "contact@stockino.space",
    hostingProvider:
      process.env.NEXT_PUBLIC_SITE_HOSTING_PROVIDER?.trim() ||
      "Netlify, Inc. — 44 Montgomery Street, Suite 300, San Francisco, CA 94104, États-Unis",
    hostingSite: "https://www.netlify.com",
  };
}
