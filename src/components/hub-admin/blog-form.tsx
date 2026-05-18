"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import {
  createBlogPostAction,
  updateBlogPostAction,
  type HubActionState,
} from "@/lib/hub/actions";
import type { HubBlogRow } from "@/lib/hub/db-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: HubActionState = { status: "idle" };

type BlogFormProps = {
  post?: HubBlogRow;
  basePath?: string;
};

function arrayToLines(arr: string[] | unknown): string {
  if (!Array.isArray(arr)) return "";
  return arr.filter((x): x is string => typeof x === "string").join("\n");
}

export function BlogForm({ post, basePath = "/studio" }: BlogFormProps) {
  const router = useRouter();
  const isEdit = Boolean(post);
  const action = isEdit ? updateBlogPostAction : createBlogPostAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.push(`${basePath}/blog`);
      router.refresh();
    }
  }, [state.status, router]);

  const publishedAtDefault =
    post?.published_at?.split("T")[0] ?? new Date().toISOString().split("T")[0];

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-6">
      {isEdit ? <input type="hidden" name="id" value={post!.id} /> : null}

      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Titre</Label>
          <Input id="title" name="title" defaultValue={post?.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={post?.slug}
            placeholder="meilleur-scanner-2026"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedAt">Date de publication</Label>
          <Input
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={publishedAtDefault}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Résumé (SEO)</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={post?.description}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          name="category"
          defaultValue={post?.category ?? ""}
          placeholder="Guides d'achat"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenu (Markdown)</Label>
        <Textarea
          id="content"
          name="content"
          rows={16}
          className="font-mono text-sm"
          defaultValue={post?.content}
          required
        />
        <p className="text-xs text-muted-foreground">
          Utilisez ## pour les titres, **gras**, listes avec -, liens [texte](/hardware/slug)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (un par ligne)</Label>
          <Textarea id="tags" name="tags" rows={3} defaultValue={arrayToLines(post?.tags)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="relatedHardwareSlugs">Produits liés (slugs, un par ligne)</Label>
          <Textarea
            id="relatedHardwareSlugs"
            name="relatedHardwareSlugs"
            rows={3}
            defaultValue={arrayToLines(post?.related_hardware_slugs)}
            placeholder="zebra-ds2208"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">Image de couverture (URL optionnelle)</Label>
        <Input id="coverImage" name="coverImage" defaultValue={post?.cover_image ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post?.published ?? true}
          className="h-4 w-4 rounded border"
        />
        Publié (visible sur le site)
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Publier l'article"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
