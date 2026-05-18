import { redirect } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { HubLanding } from "@/components/hub/hub-landing";
import { getUser } from "@/lib/auth/session";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { organizationSchema, webSiteSchema } from "@/lib/seo/schemas";

export const metadata = buildPublicMetadata({
  title: "Gestion de stock & Tech Hub matériel",
  description:
    "Application de gestion de stock pour professionnels, guides d'achat et matériel recommandé (scanners, imprimantes d'étiquettes) — France & Maroc.",
  path: "/",
});

export default async function HomePage() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />
      <HubLanding />
    </>
  );
}
