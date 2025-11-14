"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

import {
  useTranslations,
  useLocale,
} from "@/components/i18n/translations-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, type Locale } from "@/i18n/config";
import { setLocaleAction } from "@/lib/i18n/actions";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");
  const common = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: Locale) => {
    startTransition(async () => {
      await setLocaleAction(value);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onSelect={(event) => {
              event.preventDefault();
              handleChange(loc);
            }}
            className={loc === locale ? "font-semibold" : undefined}
          >
            <span>{t(loc)}</span>
            {isPending && loc === locale ? (
              <span className="ml-auto text-xs text-muted-foreground">
                {common("loading", "…")}
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

