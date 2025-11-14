"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";
import { LOCALE_COOKIE_NAME } from "@/i18n/locale";

export async function setLocaleAction(locale: Locale) {
  const normalized = LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, normalized, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

