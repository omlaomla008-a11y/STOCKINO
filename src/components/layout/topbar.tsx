"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";

import { useTranslations } from "@/components/i18n/translations-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { signOutAction } from "@/lib/auth/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type ProfileSummary = {
  email: string;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  organization_name: string | null;
};

type TopbarProps = {
  profile: ProfileSummary;
};

export function Topbar({ profile }: TopbarProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("topbar");

  const displayName =
    profile.full_name ??
    profile.email.split("@")[0] ??
    "Utilisateur";

  const avatarUrl = profile.avatar_url;

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    startTransition(async () => {
      try {
        // Déconnexion côté client uniquement
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        
        // Redirection immédiate
        window.location.href = "/signin";
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        // Redirection même en cas d'erreur
        window.location.href = "/signin";
      }
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4">
        <MobileNav
          profile={profile}
          onSignOut={handleSignOut}
          signingOut={isPending}
        />
        <div className="hidden flex-1 items-center gap-2 rounded-full border bg-muted/40 px-3 py-2 text-sm lg:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">{t("notifications")}</span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} />
                  ) : (
                    <AvatarFallback>{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden text-left text-sm font-medium md:flex md:flex-col">
                  <span>{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {profile.organization_name ?? t("noOrganization")}
                  </span>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("account")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">{t("settings", "Paramètres")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>{t("helpCenter")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  handleSignOut();
                }}
              >
                {isPending ? t("pendingSignOut", "…") : t("signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

