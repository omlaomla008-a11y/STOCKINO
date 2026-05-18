import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getHardwareCategoryLabel } from "@/lib/content/hardware-labels";
import type { HardwareProduct } from "@/types/hub";

type HardwareCardProps = {
  product: HardwareProduct;
  compact?: boolean;
};

export function HardwareCard({ product, compact = false }: HardwareCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3 pb-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{getHardwareCategoryLabel(product.category)}</Badge>
          {product.featured ? <Badge>Recommandé</Badge> : null}
        </div>
        <CardTitle className="text-lg leading-snug">
          <Link href={`/hardware/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{product.shortDescription}</p>
        {!compact && product.specs.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {product.specs.slice(0, 3).map((spec) => (
              <li key={spec}>• {spec}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="w-full sm:flex-1" asChild>
          <Link href={`/hardware/${product.slug}`}>Voir la fiche</Link>
        </Button>
        <Button className="w-full sm:flex-1" asChild>
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            {product.affiliateLabel ?? "Acheter sur Amazon.fr"}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
