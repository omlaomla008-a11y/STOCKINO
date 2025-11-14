"use client";

import Image from "next/image";
import { useState, useTransition, useEffect } from "react";
import { Loader2, Upload, X } from "lucide-react";

import { PRODUCT_STATUSES } from "@/lib/constants";
import { updateProductAction, type UpdateProductInput } from "@/lib/products/actions";
import { useSupabaseBrowser } from "@/lib/supabase/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type Product = {
  id: string;
  organization_id: string;
  name: string;
  category: string | null;
  description: string | null;
  status: string;
  quantity: number;
  price: number | null;
  image_url: string | null;
};

type EditProductDialogProps = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: (product: Product) => void;
};

const statusOptions: Array<{ value: (typeof PRODUCT_STATUSES)[number]; label: string }> = [
  { value: "in_stock", label: "En stock" },
  { value: "low_stock", label: "Seuil d'alerte" },
  { value: "out_of_stock", label: "Rupture" },
  { value: "archived", label: "Archivé" },
];

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onProductUpdated,
}: EditProductDialogProps) {
  const supabase = useSupabaseBrowser();

  const [form, setForm] = useState({
    name: product.name,
    category: product.category ?? "",
    stock: product.quantity,
    status: product.status as (typeof PRODUCT_STATUSES)[number],
    description: product.description ?? "",
    price: product.price?.toString() ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image_url);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Réinitialiser le formulaire quand le produit change
  useEffect(() => {
    if (open) {
      setForm({
        name: product.name,
        category: product.category ?? "",
        stock: product.quantity,
        status: product.status as (typeof PRODUCT_STATUSES)[number],
        description: product.description ?? "",
        price: product.price?.toString() ?? "",
      });
      setFile(null);
      setPreviewUrl(product.image_url);
      setError(null);
    }
  }, [product, open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "stock" ? Number.parseInt(value || "0", 10) : value,
    }));
  };

  const uploadImageIfNeeded = async () => {
    if (!file) return product.image_url;

    const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
    const path = `${product.organization_id}/${Date.now()}-${sanitizedName}`;

    // Supprimer l'ancienne image si elle existe
    if (product.image_url) {
      try {
        const urlParts = product.image_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const oldPath = `${product.organization_id}/${fileName}`;
        await supabase.storage.from("product-images").remove([oldPath]);
      } catch (err) {
        console.warn("Impossible de supprimer l'ancienne image:", err);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return data?.publicUrl ?? null;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const imageUrl = await uploadImageIfNeeded();

        const input: UpdateProductInput = {
          productId: product.id,
          name: form.name.trim(),
          category: form.category.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
          stock: Number.isNaN(form.stock) ? 0 : form.stock,
          price: form.price ? Number.parseFloat(form.price) : null,
          imageUrl,
        };

        const result = await updateProductAction(input);

        if (result.status === "error") {
          setError(result.message);
          return;
        }

        onProductUpdated(result.product);
        onOpenChange(false);
      } catch (err) {
        console.error(err);
        setError(
          "Impossible de téléverser l'image pour l'instant. Vérifiez vos droits Supabase Storage.",
        );
      }
    });
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du produit. Les modifications seront enregistrées dans Supabase.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom du produit</Label>
            <Input
              id="edit-name"
              name="name"
              required
              placeholder="Ex. Huile d'olive bio"
              value={form.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <Input
                id="edit-category"
                name="category"
                placeholder="Alimentaire, cosmétique..."
                value={form.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock disponible</Label>
              <Input
                id="edit-stock"
                name="stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-status">État du stock</Label>
              <Select
                value={form.status}
                onValueChange={(value: (typeof PRODUCT_STATUSES)[number]) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Prix (optionnel)</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                placeholder="19.90"
                value={form.price}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              placeholder="Détails du produit, provenance, remarques..."
              rows={3}
              value={form.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">Photo du produit</Label>
            <label
              htmlFor="edit-image"
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/40 px-4 py-6 text-center transition hover:border-primary/60 hover:bg-primary/5",
                previewUrl && "border-solid",
              )}
            >
              {previewUrl ? (
                <>
                  <div className="relative h-40 w-full overflow-hidden rounded-md">
                    <Image
                      src={previewUrl}
                      alt="Prévisualisation du produit"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveImage();
                    }}
                    className="absolute right-2 top-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez ou cliquez pour sélectionner une image (jpg, png, webp)
                  </p>
                </>
              )}
            </label>
            <Input
              id="edit-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

