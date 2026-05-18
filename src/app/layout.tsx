import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { TranslationsProvider } from "@/components/i18n/translations-provider";
import { DEFAULT_LOCALE, RTL_LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getRequestLocale } from "@/i18n/locale";
import { DEFAULT_KEYWORDS, getDefaultOgImageUrl, getSiteUrl, SITE_NAME } from "@/lib/seo/site";
import { GoogleAnalyticsProvider } from "@/components/analytics/google-analytics";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Gestion de stock & Tech Hub`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Gestion de stock pour professionnels, guides matériel et recommandations scanners & imprimantes d'étiquettes — France & Maroc.",
  keywords: [...DEFAULT_KEYWORDS],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Gestion de stock & Tech Hub`,
    description:
      "Gestion de stock pour professionnels, guides matériel et recommandations scanners & imprimantes d'étiquettes.",
    images: [{ url: getDefaultOgImageUrl(), width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Gestion de stock & hub matériel pour professionnels.",
    images: [getDefaultOgImageUrl()],
  },
  ...(gscVerification
    ? { verification: { google: gscVerification } }
    : {}),
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
        <GoogleAnalyticsProvider />
      </body>
    </html>
  );
}
