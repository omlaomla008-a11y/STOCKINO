"use client";

import { HARDWARE_CATEGORIES } from "@/types/hub";
import { getHardwareCategoryLabel } from "@/lib/content/hardware-labels";
import type { HardwareProduct } from "@/types/hub";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HardwareFiltersProps = {
  category: string;
  onCategoryChange: (value: string) => void;
  productCount: number;
};

export function HardwareFilters({
  category,
  onCategoryChange,
  productCount,
}: HardwareFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {productCount} produit{productCount !== 1 ? "s" : ""}
      </p>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[240px]">
          <SelectValue placeholder="Toutes les catégories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les catégories</SelectItem>
          {HARDWARE_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {getHardwareCategoryLabel(cat)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function filterHardwareByCategory(
  products: HardwareProduct[],
  category: string,
): HardwareProduct[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}
