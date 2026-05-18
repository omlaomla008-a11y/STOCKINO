import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AffiliateDisclosure } from "@/components/hub/affiliate-disclosure";
import { MoroccoDeliveryNote } from "@/components/hub/morocco-delivery-note";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllHardwareProducts, getHardwareProductBySlug } from "@/lib/content/hardware";
import { getHardwareCategoryLabel } from "@/lib/content/hardware-labels";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { breadcrumbSchema } from "@/lib/seo/schemas";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getAllHardwareProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getHardwareProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };

  const image = product.image.startsWith("http")
    ? product.image
    : absoluteUrl(product.image);

  return buildPublicMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/hardware/${slug}`,
    ogImage: image,
    keywords: [product.name, "scanner", "matériel stock", product.category],
  });
}

export default async function HardwareDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getHardwareProductBySlug(slug);
  if (!product) notFound();

  const productImage = product.image.startsWith("http")
    ? product.image
    : absoluteUrl(product.image);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: productImage,
    offers: {
      "@type": "Offer",
      url: product.affiliateUrl,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Accueil", path: "/" },
            { name: "Matériel", path: "/hardware" },
            { name: product.name, path: `/hardware/${slug}` },
          ]),
          productSchema,
        ]}
      />
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/hardware">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au catalogue
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-8"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{getHardwareCategoryLabel(product.category)}</Badge>
            {product.featured ? <Badge>Recommandé</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground">{product.shortDescription}</p>
          <MoroccoDeliveryNote />
          <Button size="lg" asChild>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              {product.affiliateLabel ?? "Acheter sur Amazon.fr"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spécifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {product.specs.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avantages</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {product.pros.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Limites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {product.cons.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {product.useCases.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Cas d&apos;usage idéaux</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {product.useCases.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-10 max-w-2xl">
        <AffiliateDisclosure />
      </div>
    </div>
  );
}
