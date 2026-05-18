"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { deleteBlogPostAction } from "@/lib/hub/actions";
import type { HubBlogRow } from "@/lib/hub/db-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BlogListClientProps = {
  posts: HubBlogRow[];
  basePath?: string;
};

export function BlogListClient({ posts, basePath = "/studio" }: BlogListClientProps) {
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer « ${title} » ?`)) return;
    const result = await deleteBlogPostAction(id);
    if (result.status === "error") {
      alert(result.message);
      return;
    }
    router.refresh();
  };

  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Aucun article en base. Créez votre premier guide ou exécutez la migration SQL dans
        Supabase.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.title}</TableCell>
            <TableCell className="text-muted-foreground">{p.slug}</TableCell>
            <TableCell>{p.published_at}</TableCell>
            <TableCell>
              {p.published ? (
                <Badge variant="secondary">Publié</Badge>
              ) : (
                <Badge variant="outline">Brouillon</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`${basePath}/blog/${p.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id, p.title)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
