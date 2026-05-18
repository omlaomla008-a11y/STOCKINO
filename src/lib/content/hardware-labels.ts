import { HARDWARE_CATEGORIES, type HardwareCategory } from "@/types/hub";

export function getHardwareCategoryLabel(category: HardwareCategory): string {
  const labels: Record<HardwareCategory, string> = {
    scanners: "Scanners code-barres",
    imprimantes: "Imprimantes d'étiquettes",
    consommables: "Consommables",
    terminaux: "Terminaux & PDA",
  };
  return labels[category] ?? category;
}

export function isHardwareCategory(value: string): value is HardwareCategory {
  return (HARDWARE_CATEGORIES as readonly string[]).includes(value);
}
