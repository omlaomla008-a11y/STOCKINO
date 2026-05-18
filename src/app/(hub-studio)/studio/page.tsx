import Link from "next/link";
import { BookOpen, ExternalLink, Package } from "lucide-react";

import { requireHubStudio } from "@/lib/hub/studio-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function StudioHomePage() {
  await requireHubStudio();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Studio Tech Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Gérez le matériel et les articles publiés sur stockino.space — accès par mot de passe, sans
          compte application.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Package className="h-8 w-8 text-primary" />
            <CardTitle className="mt-2">Matériel recommandé</CardTitle>
            <CardDescription>Scanners, imprimantes, liens Amazon.fr</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/studio/hardware">Gérer le catalogue</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/hardware" target="_blank">
                Voir le site public
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 text-primary" />
            <CardTitle className="mt-2">Guides & Blog</CardTitle>
            <CardDescription>Articles en Markdown</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/studio/blog">Gérer les articles</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/blog" target="_blank">
                Voir le site public
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

