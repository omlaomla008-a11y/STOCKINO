import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogForm } from "@/components/hub-admin/blog-form";
import { requireHubAdmin } from "@/lib/hub/auth";
import { getBlogByIdForAdmin } from "@/lib/hub/queries";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditHubBlogPage({ params }: PageProps) {
  await requireHubAdmin();
  const { id } = await params;
  const post = await getBlogByIdForAdmin(id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/hub/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Modifier l&apos;article</h1>
      <BlogForm post={post} />
    </div>
  );
}
