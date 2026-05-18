import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { HubLanding } from "@/components/hub/hub-landing";
import { getUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "STOCKINO | Gestion de stock & Tech Hub matériel",
  description:
    "Application de gestion de stock pour professionnels, guides d'achat et matériel recommandé (scanners, imprimantes d'étiquettes) — France & Maroc.",
};

export default async function HomePage() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return <HubLanding />;
}
