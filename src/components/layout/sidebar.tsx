"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTranslations } from "@/components/i18n/translations-provider";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Logo } from "@/components/common/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const tSidebar = useTranslations("sidebar");
  const tTopbar = useTranslations("topbar");

  return (
    <div className="hidden h-full w-64 shrink-0 border-r bg-background/80 px-4 py-6 backdrop-blur lg:flex lg:flex-col">
      <Logo />
      <ScrollArea className="mt-8 flex-1">
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
      <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-3">
        <div>
          <p className="text-sm font-medium">{tTopbar("theme")}</p>
          <p className="text-xs text-muted-foreground">
            {tTopbar("themeDescription")}
          </p>
        </div>
        <ModeToggle />
      </div>
      <Button className="mt-4 w-full" variant="default">
        + {tSidebar("quickAdd")}
      </Button>
    </div>
  );
}

