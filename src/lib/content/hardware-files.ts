import { readFile, readdir } from "fs/promises";
import path from "path";

import { HARDWARE_CONTENT_DIR } from "@/lib/content/paths";
import type { HardwareProduct } from "@/types/hub";

function parseHardwareFile(raw: string, filename: string): HardwareProduct {
  const data = JSON.parse(raw) as HardwareProduct;
  if (!data.slug) {
    data.slug = path.basename(filename, ".json");
  }
  return data;
}

export async function getAllHardwareProductsFromFiles(): Promise<HardwareProduct[]> {
  let files: string[];
  try {
    files = await readdir(HARDWARE_CONTENT_DIR);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const products = await Promise.all(
    jsonFiles.map(async (file) => {
      const raw = await readFile(path.join(HARDWARE_CONTENT_DIR, file), "utf-8");
      return parseHardwareFile(raw, file);
    }),
  );

  return products.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.name.localeCompare(b.name, "fr");
  });
}
