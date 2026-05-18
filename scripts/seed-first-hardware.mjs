/**
 * Insère le premier produit hub (Zebra DS2208) via la clé service Supabase.
 * Usage : node scripts/seed-first-hardware.mjs
 * Charge les variables depuis .env.local à la racine du projet.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tag = process.env.AMAZON_ASSOCIATE_TAG || "stockino-21";

if (!url || !key) {
  console.error("Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY dans .env.local");
  process.exit(1);
}

const baseAffiliate = "https://www.amazon.fr/dp/B06VYGFGR7";
const affiliateUrl = `${baseAffiliate}?tag=${encodeURIComponent(tag)}`;

const row = {
  slug: "zebra-ds2208",
  name: "Zebra DS2208",
  category: "scanners",
  image: "/images/hardware/zebra-ds2208.svg",
  short_description:
    "Scanner code-barres 1D/2D filaire, fiable pour entrepôt et point de vente. Référence polyvalente pour démarrer avec Stockino.",
  specs: [
    "Lecture 1D et 2D (QR, Data Matrix)",
    "Connexion USB filaire",
    "Déclenchement automatique ou manuel",
    "Compatible Windows, macOS, Android (OTG)",
  ],
  pros: [
    "Excellent rapport qualité-prix",
    "Lecture rapide même sur étiquettes abîmées",
    "Marque professionnelle reconnue en logistique",
  ],
  cons: [
    "Câble USB uniquement (pas de sans-fil)",
    "Nécessite un adaptateur OTG sur certains smartphones",
  ],
  use_cases: [
    "Inventaire en entrepôt avec PC portable",
    "Caisse et reçus avec application web",
    "PME e-commerce qui scanne les colis à l'expédition",
  ],
  affiliate_url: affiliateUrl,
  affiliate_label: "Voir sur Amazon.fr",
  featured: true,
  published: true,
  sort_order: 0,
};

const supabase = createClient(url, key);

const { data: existing } = await supabase
  .from("hub_hardware_products")
  .select("id")
  .eq("slug", row.slug)
  .maybeSingle();

let error;
if (existing?.id) {
  ({ error } = await supabase.from("hub_hardware_products").update(row).eq("id", existing.id));
} else {
  ({ error } = await supabase.from("hub_hardware_products").insert(row));
}

if (error) {
  console.error("Échec:", error.message);
  process.exit(1);
}

console.log("OK — Zebra DS2208 enregistré (slug: zebra-ds2208)");
console.log("Fiche publique : /hardware/zebra-ds2208");
console.log("Lien affilié :", affiliateUrl);
