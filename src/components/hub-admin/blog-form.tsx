"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  createBlogPostAction,
  updateBlogPostAction,
  uploadHubImageAction,
  type HubActionState,
} from "@/lib/hub/actions";
import { AFFILIATE_BLOG_CATEGORIES } from "@/lib/hub/blog-affiliate";
import type { HubBlogRow } from "@/lib/hub/db-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: HubActionState = { status: "idle" };

const BLOG_CATEGORY_SUGGESTIONS = [
  ...AFFILIATE_BLOG_CATEGORIES,
  "Actualités",
  "Logistique",
  "Gestion de stock",
  "International",
  "Tutoriels",
];

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
  const fileRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      router.push(`${basePath}/blog`);
      router.refresh();
    }
  }, [state.status, router, basePath]);

  const publishedAtDefault =
    post?.published_at?.split("T")[0] ?? new Date().toISOString().split("T")[0];

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadHubImageAction(fd);
    setUploading(false);
    if (result.status === "success" && result.imageUrl) {
      setCoverImage(result.imageUrl);
    } else {
      alert(result.message ?? "Échec de l'upload");
    }
  };

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-6">
      {isEdit ? <input type="hidden" name="id" value={post!.id} /> : null}
      <input type="hidden" name="coverImage" value={coverImage} />

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
          list="blog-categories"
          defaultValue={post?.category ?? ""}
          placeholder="Actualités"
        />
        <datalist id="blog-categories">
          {BLOG_CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          Mentions Amazon affichées uniquement pour «{" "}
          {AFFILIATE_BLOG_CATEGORIES.join(" » ou « ")} », ou si des produits liés sont
          renseignés. Les autres catégories (Actualités, Logistique, etc.) n&apos;affichent pas
          ces blocs.
        </p>
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
          <p className="text-xs text-muted-foreground">
            Laissez vide pour un article éditorial sans fiches matériel.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <Label>Image de couverture</Label>
        <p className="text-xs text-muted-foreground">
          Affichée en haut de l&apos;article (sous le titre). Uploadez une image ou collez une URL.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="max-w-xs"
          />
          <Button type="button" variant="secondary" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Envoi…" : "Uploader"}
          </Button>
        </div>
        <Input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://… ou /images/…"
        />
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt="Aperçu couverture"
            className="mt-2 max-h-40 rounded-md border object-cover"
          />
        ) : null}
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
