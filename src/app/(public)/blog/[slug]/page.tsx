import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";

import { MarkdownContent } from "@/components/blog/markdown-content";
import { HardwareCard } from "@/components/hardware/hardware-card";
import { AffiliateDisclosure } from "@/components/hub/affiliate-disclosure";
import { MoroccoDeliveryNote } from "@/components/hub/morocco-delivery-note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/content/blog";
import { getHardwareProductBySlug } from "@/lib/content/hardware";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article introuvable" };

  return {
    title: `${post.title} | STOCKINO Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const relatedProducts = await Promise.all(
    (post.relatedHardwareSlugs ?? []).map((s) => getHardwareProductBySlug(s)),
  );
  const products = relatedProducts.filter((p) => p !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tous les articles
        </Link>
      </Button>

      {post.category ? <Badge variant="secondary">{post.category}</Badge> : null}
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {format(new Date(post.publishedAt), "d MMMM yyyy", { locale: fr })}
      </p>
      <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        <MarkdownContent content={post.content} />
      </div>

      <div className="mt-10 space-y-4">
        <MoroccoDeliveryNote />
        <AffiliateDisclosure />
      </div>

      {products.length > 0 ? (
        <section className="mt-14 border-t pt-10">
          <h2 className="text-xl font-semibold">Matériel mentionné</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {products.map((product) => (
              <HardwareCard key={product.slug} product={product} compact />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
