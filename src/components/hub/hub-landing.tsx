import Link from "next/link";
import { ArrowRight, BookOpen, Package, ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HubLanding() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Stock & Print Tech Hub
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Gérez votre stock. Équipez-vous comme un pro.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Stockino combine une application de gestion de stock intuitive et un hub d&apos;expertise
          matériel : scanners, imprimantes d&apos;étiquettes et guides pour la francophonie (France &
          Maroc).
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Démarrer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/hardware">Voir le matériel recommandé</Link>
          </Button>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Package className="h-8 w-8 text-primary" />
            <CardTitle className="mt-2">Application Stockino</CardTitle>
            <CardDescription>
              Produits, ventes, bons d&apos;entrée/sortie et rapports pour votre organisation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0" asChild>
              <Link href="/signin">Accéder à l&apos;app →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <ScanLine className="h-8 w-8 text-primary" />
            <CardTitle className="mt-2">Matériel recommandé</CardTitle>
            <CardDescription>
              Scanners, imprimantes et terminaux testés pour travailler avec Stockino.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0" asChild>
              <Link href="/hardware">Parcourir le catalogue →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 text-primary" />
            <CardTitle className="mt-2">Guides & Blog</CardTitle>
            <CardDescription>
              Comparatifs et tutoriels pour choisir le bon équipement et optimiser votre stock.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0" asChild>
              <Link href="/blog">Lire les guides →</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
