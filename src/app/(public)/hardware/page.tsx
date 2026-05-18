import type { Metadata } from "next";

import { AffiliateDisclosure } from "@/components/hub/affiliate-disclosure";
import { MoroccoDeliveryNote } from "@/components/hub/morocco-delivery-note";
import { HardwareGallery } from "@/components/hardware/hardware-gallery";
import { getAllHardwareProducts } from "@/lib/content/hardware";

export const metadata: Metadata = {
  title: "Matériel recommandé | STOCKINO Tech Hub",
  description:
    "Scanners code-barres, imprimantes d'étiquettes et terminaux recommandés pour la gestion de stock avec Stockino. Liens Amazon.fr.",
};

export default async function HardwarePage() {
  const products = await getAllHardwareProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Matériel recommandé</h1>
        <p className="mt-4 text-muted-foreground">
          Équipement professionnel sélectionné pour la gestion de stock et l&apos;impression
          d&apos;étiquettes. Compatible avec Stockino et adapté aux PME en francophonie.
        </p>
        <div className="mt-6">
          <MoroccoDeliveryNote />
        </div>
      </div>
      <div className="mt-10">
        <HardwareGallery products={products} />
      </div>
      <div className="mt-10 max-w-2xl">
        <AffiliateDisclosure />
      </div>
    </div>
  );
}
