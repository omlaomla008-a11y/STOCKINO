import Link from "next/link";

import { AffiliateDisclosure } from "@/components/hub/affiliate-disclosure";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-semibold">STOCKINO</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Gestion de stock et hub matériel pour professionnels en francophonie.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Tech Hub</p>
            <Link href="/hardware" className="block text-muted-foreground hover:text-foreground">
              Matériel recommandé
            </Link>
            <Link href="/blog" className="block text-muted-foreground hover:text-foreground">
              Guides & Blog
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Application</p>
            <Link href="/signin" className="block text-muted-foreground hover:text-foreground">
              Connexion
            </Link>
            <Link href="/signup" className="block text-muted-foreground hover:text-foreground">
              Créer un compte
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Informations</p>
            <Link href="/contact" className="block text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link
              href="/mentions-legales"
              className="block text-muted-foreground hover:text-foreground"
            >
              Mentions légales
            </Link>
            <Link
              href="/confidentialite"
              className="block text-muted-foreground hover:text-foreground"
            >
              Confidentialité
            </Link>
          </div>
        </div>
        <AffiliateDisclosure />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Stockino.space — Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
