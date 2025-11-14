import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { TranslationsProvider } from "@/components/i18n/translations-provider";
import { DEFAULT_LOCALE, RTL_LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getRequestLocale } from "@/i18n/locale";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STOCKINO | Gestion de stock universelle",
  description:
    "Tableau de bord intuitif pour piloter produits, ventes, entrées et sorties avec Supabase et React.",
};

function getDirection(locale: Locale) {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const direction = getDirection(locale);

  return (
    <html lang={locale ?? DEFAULT_LOCALE} dir={direction} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <TranslationsProvider locale={locale} dictionary={dictionary}>
          <AppProviders>{children}</AppProviders>
        </TranslationsProvider>
      </body>
    </html>
  );
}
