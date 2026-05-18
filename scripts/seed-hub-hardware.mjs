/**
 * Synchronise tous les produits JSON → Supabase (upsert par slug).
 * Usage : node scripts/seed-hub-hardware.mjs
 */
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const hardwareDir = join(root, "src", "content", "hardware");
const envPath = join(root, ".env.local");

function loadEnv() {
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

function withAffiliateTag(url, tag) {
  if (!url || !tag) return url;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("amazon.")) return url;
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return url;
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

const supabase = createClient(url, key);
const files = readdirSync(hardwareDir).filter((f) => f.endsWith(".json"));

let ok = 0;
let fail = 0;

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(hardwareDir, file), "utf8"));
  const slug = raw.slug || file.replace(/\.json$/, "");
  const sortOrder = raw.featured ? 0 : raw.sortOrder ?? ok + 1;

  const row = {
    slug,
    name: raw.name,
    category: raw.category,
    image: raw.image,
    short_description: raw.shortDescription,
    specs: raw.specs ?? [],
    pros: raw.pros ?? [],
    cons: raw.cons ?? [],
    use_cases: raw.useCases ?? [],
    affiliate_url: withAffiliateTag(raw.affiliateUrl, tag),
    affiliate_label: raw.affiliateLabel ?? "Voir sur Amazon.fr",
    featured: Boolean(raw.featured),
    published: raw.published !== false,
    sort_order: sortOrder,
  };

  const { data: existing } = await supabase
    .from("hub_hardware_products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  const { error } = existing?.id
    ? await supabase.from("hub_hardware_products").update(row).eq("id", existing.id)
    : await supabase.from("hub_hardware_products").insert(row);

  if (error) {
    console.error(`✗ ${slug}:`, error.message);
    fail += 1;
  } else {
    console.log(`✓ ${slug}`);
    ok += 1;
  }
}

console.log(`\nTerminé : ${ok} OK, ${fail} erreur(s).`);
