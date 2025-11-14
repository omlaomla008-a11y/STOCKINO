import "server-only";

import type { Locale } from "./config";

const dictionaries: Record<Locale, () => Promise<Record<string, unknown>>> = {
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  ar: () => import("./dictionaries/ar.json").then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  const loadDictionary = dictionaries[locale];
  return loadDictionary();
}

