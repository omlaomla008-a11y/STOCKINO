import { AffiliateDisclosure } from "@/components/hub/affiliate-disclosure";
import { MoroccoDeliveryNote } from "@/components/hub/morocco-delivery-note";
import { HardwareGallery } from "@/components/hardware/hardware-gallery";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllHardwareProducts } from "@/lib/content/hardware";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schemas";

export const metadata = buildPublicMetadata({
  title: "Matériel recommandé — scanners & imprimantes",
  description:
    "Scanners code-barres, imprimantes d'étiquettes et terminaux recommandés pour la gestion de stock avec Stockino. Liens Amazon.fr.",
  path: "/hardware",
  keywords: [
    "scanner code-barres",
    "imprimante étiquettes",
    "matériel entrepôt",
    "Amazon.fr",
    "Stockino",
  ],
});

export default async function HardwarePage() {
  const products = await getAllHardwareProducts();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Matériel", path: "/hardware" },
        ])}
      />
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
    </>
  );
}
