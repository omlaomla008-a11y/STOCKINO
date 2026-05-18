"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  createHardwareAction,
  updateHardwareAction,
  uploadHubImageAction,
  type HubActionState,
} from "@/lib/hub/actions";
import type { HubHardwareRow } from "@/lib/hub/db-types";
import { HARDWARE_CATEGORIES, type HardwareCategory } from "@/types/hub";
import { getHardwareCategoryLabel } from "@/lib/content/hardware-labels";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: HubActionState = { status: "idle" };

type HardwareFormProps = {
  product?: HubHardwareRow;
  basePath?: string;
};

function arrayToLines(arr: string[] | unknown): string {
  if (!Array.isArray(arr)) return "";
  return arr.filter((x): x is string => typeof x === "string").join("\n");
}

export function HardwareForm({ product, basePath = "/studio" }: HardwareFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const action = isEdit ? updateHardwareAction : createHardwareAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(product?.image ?? "");
  const [category, setCategory] = useState<HardwareCategory>(
    product?.category ?? "scanners",
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      router.push(`${basePath}/hardware`);
      router.refresh();
    }
  }, [state.status, router]);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadHubImageAction(fd);
    setUploading(false);
    if (result.status === "success" && result.imageUrl) {
      setImageUrl(result.imageUrl);
    } else {
      alert(result.message ?? "Échec de l'upload");
    }
  };

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      {isEdit ? <input type="hidden" name="id" value={product!.id} /> : null}
      <input type="hidden" name="category" value={category} />

      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom du produit</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={product?.slug}
            placeholder="zebra-ds2208"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as HardwareCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HARDWARE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {getHardwareCategoryLabel(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Description courte</Label>
        <Textarea
          id="shortDescription"
          name="shortDescription"
          rows={3}
          defaultValue={product?.short_description}
          required
        />
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <Label>Image</Label>
        <input type="hidden" name="image" value={imageUrl} required />
        <div className="flex flex-wrap gap-2">
          <Input ref={fileRef} type="file" accept="image/*" className="max-w-xs" />
          <Button type="button" variant="secondary" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Envoi…" : "Uploader"}
          </Button>
        </div>
        {imageUrl ? (
          <p className="break-all text-xs text-muted-foreground">{imageUrl}</p>
        ) : null}
        <Input
          placeholder="https://… ou /images/hardware/…"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specs">Spécifications (une par ligne)</Label>
        <Textarea id="specs" name="specs" rows={4} defaultValue={arrayToLines(product?.specs)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pros">Avantages</Label>
          <Textarea id="pros" name="pros" rows={4} defaultValue={arrayToLines(product?.pros)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cons">Limites</Label>
          <Textarea id="cons" name="cons" rows={4} defaultValue={arrayToLines(product?.cons)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="useCases">Cas d&apos;usage</Label>
        <Textarea
          id="useCases"
          name="useCases"
          rows={3}
          defaultValue={arrayToLines(product?.use_cases)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="affiliateUrl">Lien Amazon.fr (affiliation)</Label>
          <Input
            id="affiliateUrl"
            name="affiliateUrl"
            type="url"
            defaultValue={product?.affiliate_url}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="affiliateLabel">Texte du bouton</Label>
          <Input
            id="affiliateLabel"
            name="affiliateLabel"
            defaultValue={product?.affiliate_label ?? "Acheter sur Amazon.fr"}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured}
            className="h-4 w-4 rounded border"
          />
          Mis en avant
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={product?.published ?? true}
            className="h-4 w-4 rounded border"
          />
          Publié (visible sur le site)
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Ordre d&apos;affichage</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={product?.sort_order ?? 0}
          className="w-32"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || !imageUrl}>
          {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le produit"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
