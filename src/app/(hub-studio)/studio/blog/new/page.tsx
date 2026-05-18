import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BlogForm } from "@/components/hub-admin/blog-form";
import { requireHubStudio } from "@/lib/hub/studio-auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function StudioNewBlogPage() {
  await requireHubStudio();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/studio/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Nouvel article</h1>
      <BlogForm />
    </div>
  );
}

