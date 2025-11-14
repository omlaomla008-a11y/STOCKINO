import { cookies, headers } from "next/headers";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";

const LOCALE_COOKIE_NAME = "locale";

export function resolveLocale(input?: string | null): Locale {
  if (!input) return DEFAULT_LOCALE;
  return LOCALES.find((locale) => locale === input) ?? DEFAULT_LOCALE;
}

export async function getLocaleFromHeaders(): Promise<Locale> {
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const languages = acceptLanguage
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim())
    .filter(Boolean);

  const matched = languages.find((lang) =>
    LOCALES.includes(lang.slice(0, 2) as Locale),
  );

  return resolveLocale(matched?.slice(0, 2) ?? DEFAULT_LOCALE);
}

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale) {
    return resolveLocale(cookieLocale);
  }
  return getLocaleFromHeaders();
}

export { LOCALE_COOKIE_NAME };