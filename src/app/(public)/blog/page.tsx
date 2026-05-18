import type { Metadata } from "next";

import { BlogCard } from "@/components/blog/blog-card";
import { getAllBlogPosts } from "@/lib/content/blog";

export const metadata: Metadata = {
  title: "Guides & Blog | STOCKINO Tech Hub",
  description:
    "Guides d'achat, comparatifs et tutoriels sur la gestion de stock, les scanners code-barres et l'impression d'étiquettes.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Guides & Blog</h1>
        <p className="mt-4 text-muted-foreground">
          Conseils d&apos;experts pour choisir votre matériel et optimiser votre inventaire avec
          Stockino.
        </p>
      </div>
      {posts.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">Aucun article pour le moment.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
