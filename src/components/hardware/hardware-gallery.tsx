"use client";

import { useMemo, useState } from "react";

import { HardwareCard } from "@/components/hardware/hardware-card";
import {
  HardwareFilters,
  filterHardwareByCategory,
} from "@/components/hardware/hardware-filters";
import type { HardwareProduct } from "@/types/hub";

type HardwareGalleryProps = {
  products: HardwareProduct[];
};

export function HardwareGallery({ products }: HardwareGalleryProps) {
  const [category, setCategory] = useState("all");

  const filtered = useMemo(
    () => filterHardwareByCategory(products, category),
    [products, category],
  );

  return (
    <div className="space-y-6">
      <HardwareFilters
        category={category}
        onCategoryChange={setCategory}
        productCount={filtered.length}
      />
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Aucun produit dans cette catégorie pour le moment.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <HardwareCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
