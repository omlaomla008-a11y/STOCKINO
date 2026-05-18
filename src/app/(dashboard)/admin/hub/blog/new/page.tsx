import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BlogForm } from "@/components/hub-admin/blog-form";
import { requireHubAdmin } from "@/lib/hub/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewHubBlogPage() {
  await requireHubAdmin();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/hub/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Nouvel article</h1>
      <BlogForm />
    </div>
  );
}
