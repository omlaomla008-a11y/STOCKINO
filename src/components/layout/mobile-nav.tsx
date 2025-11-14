"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { useTranslations } from "@/components/i18n/translations-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileSummary = {
  email: string;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  organization_name: string | null;
};

type MobileNavProps = {
  profile: ProfileSummary;
  signingOut: boolean;
  onSignOut: () => void;
};

export function MobileNav({
  profile,
  signingOut,
  onSignOut,
}: MobileNavProps) {
  const pathname = usePathname();
  const tSidebar = useTranslations("sidebar");
  const tTopbar = useTranslations("topbar");

  const displayName =
    profile.full_name ??
    profile.email.split("@")[0] ??
    "Utilisateur";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{tSidebar("menu", "Menu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <SheetHeader className="px-6 py-4 text-left">
          <SheetTitle className="text-base font-semibold">
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="flex items-center gap-3 px-6 py-4">
          <Avatar className="h-10 w-10 rounded-md">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={displayName} />
            ) : (
              <AvatarFallback className="rounded-md bg-muted">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {profile.organization_name ?? tTopbar("noOrganization")}
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="flex flex-col gap-1">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{tSidebar(item.titleKey)}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="border-t px-4 py-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-3">
            <div>
              <p className="text-sm font-medium">{tTopbar("theme")}</p>
              <p className="text-xs text-muted-foreground">
                {tTopbar("themeDescription")}
              </p>
            </div>
            <ModeToggle />
          </div>
          <Button className="mt-4 w-full">+ {tSidebar("quickAdd")}</Button>
          <div className="mt-2 flex items-center justify-end">
            <LanguageSwitcher />
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-between"
            onClick={onSignOut}
            disabled={signingOut}
          >
            {signingOut ? tTopbar("pendingSignOut") : tTopbar("signOut")}
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

