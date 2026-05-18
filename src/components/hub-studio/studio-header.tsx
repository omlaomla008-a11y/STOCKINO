import Link from "next/link";
import { LogOut, Package } from "lucide-react";

import { studioLogoutAction } from "@/lib/hub/studio-actions";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/studio", label: "Accueil" },
  { href: "/studio/hardware", label: "Matériel" },
  { href: "/studio/blog", label: "Blog" },
] as const;

export function StudioHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/studio" className="flex items-center gap-2 font-semibold text-sm">
          <Package className="h-5 w-5" />
          Studio Tech Hub
        </Link>
        <nav className="hidden items-center gap-4 text-sm sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={studioLogoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </form>
      </div>
    </header>
  );
}
