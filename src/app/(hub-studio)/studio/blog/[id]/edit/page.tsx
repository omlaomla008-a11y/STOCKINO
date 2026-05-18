import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogForm } from "@/components/hub-admin/blog-form";
import { requireHubStudio } from "@/lib/hub/studio-auth";
import { getBlogByIdForAdmin } from "@/lib/hub/queries";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function StudioEditBlogPage({ params }: PageProps) {
  await requireHubStudio();
  const { id } = await params;
  const post = await getBlogByIdForAdmin(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/studio/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Modifier l&apos;article</h1>
      <BlogForm post={post} />
    </div>
  );
}
