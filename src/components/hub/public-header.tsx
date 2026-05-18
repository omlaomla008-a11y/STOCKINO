import Link from "next/link";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/hardware", label: "Matériel" },
  { href: "/blog", label: "Guides & Blog" },
] as const;

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Package className="h-5 w-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span>STOCKINO</span>
            <span className="text-xs font-normal text-muted-foreground">Stock & Print Tech Hub</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/signin">Connexion</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Essayer Stockino</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
