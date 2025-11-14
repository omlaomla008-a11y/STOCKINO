import type { ReactNode } from "react";

import { Logo } from "@/components/common/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { getRequestLocale } from "@/i18n/locale";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  await redirectIfAuthenticated();
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const layoutTexts =
    (dictionary?.layout as { auth?: Record<string, string> })?.auth ?? {};
  const meta = dictionary?.meta as { appName?: string; tagline?: string } | undefined;
  const appName = meta?.appName ?? "STOCKINO";
  const footer = layoutTexts?.footer ?? "Tous droits réservés.";

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 lg:flex-row">
      <aside className="flex flex-1 flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-background px-8 py-10">
        <div className="flex items-start justify-between">
          <Logo />
          <LanguageSwitcher />
        </div>
        <div className="space-y-4">
          <Card className="border-none bg-background/60 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle>{layoutTexts?.title ?? `Bienvenue sur ${appName}`}</CardTitle>
              <CardDescription>{layoutTexts?.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {layoutTexts?.content}
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {appName}. {footer}
        </p>
      </aside>
      <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-10">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </main>
    </div>
  );
}

