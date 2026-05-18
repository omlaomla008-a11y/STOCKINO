import Link from "next/link";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schemas";

type LegalPageProps = {
  title: string;
  path: string;
  description: string;
  children: ReactNode;
};

export function LegalPage({ title, path, description, children }: LegalPageProps) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: title, path },
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="mb-10 border-b pb-8">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span>{title}</span>
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </header>
        <div className="space-y-8 text-sm leading-relaxed text-foreground/90 sm:text-base">
          {children}
        </div>
      </article>
    </>
  );
}
