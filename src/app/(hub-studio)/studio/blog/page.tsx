import Link from "next/link";
import { Plus } from "lucide-react";

import { BlogListClient } from "@/components/hub-admin/blog-list-client";
import { requireHubStudio } from "@/lib/hub/studio-auth";
import { getAllBlogForAdmin } from "@/lib/hub/queries";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default async function StudioBlogPage() {
  await requireHubStudio();
  const posts = await getAllBlogForAdmin();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-sm text-muted-foreground">{posts.length} article(s)</p>
        </div>
        <Button asChild>
          <Link href="/studio/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Link>
        </Button>
      </div>
      <BlogListClient posts={posts} />
    </div>
  );
}

