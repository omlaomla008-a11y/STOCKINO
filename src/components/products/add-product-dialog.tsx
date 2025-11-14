"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";

import { PRODUCT_STATUSES } from "@/lib/constants";
import {
  createProductAction,
  uploadProductImageAction,
} from "@/lib/products/actions";
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
  DialogTrigger,
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

type AddProductDialogProps = {
  onProductCreated: (product: {
    id: string;
    organization_id: string;
    name: string;
    category: string | null;
    status: string;
    quantity: number;
    price: number | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
  }) => void;
  organizationId: string;
  disabled?: boolean;
};

type FormState = {
  name: string;
  category: string;
  stock: number;
  status: (typeof PRODUCT_STATUSES)[number];
  description: string;
  price: string;
};

const initialFormState: FormState = {
  name: "",
  category: "",
  stock: 0,
  status: "in_stock",
  description: "",
  price: "",
};

const statusOptions: Array<{ value: (typeof PRODUCT_STATUSES)[number]; label: string }> = [
  { value: "in_stock", label: "En stock" },
  { value: "low_stock", label: "Seuil d’alerte" },
  { value: "out_of_stock", label: "Rupture" },
  { value: "archived", label: "Archivé" },
];

export function AddProductDialog({
  onProductCreated,
  organizationId,
  disabled = false,
}: AddProductDialogProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
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

  const resetForm = () => {
    setForm(initialFormState);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const uploadImageIfNeeded = async () => {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("organizationId", organizationId);

      const result = await uploadProductImageAction(formData);

      if (result.status === "error") {
        throw new Error(result.message ?? "Erreur lors de l'upload de l'image");
      }

      return result.imageUrl ?? null;
    } catch (err) {
      console.error("Erreur upload:", err);
      throw err;
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const imageUrl = await uploadImageIfNeeded();

        const result = await createProductAction({
          organizationId,
          name: form.name.trim(),
          category: form.category.trim() || null,
          description: form.description || null,
          status: form.status,
          stock: Number.isNaN(form.stock) ? 0 : form.stock,
          price: form.price ? Number.parseFloat(form.price) : null,
          imageUrl,
        });

        if (result.status === "error") {
          setError(result.message);
          return;
        }

        onProductCreated(result.product);

        setIsOpen(false);
        resetForm();
      } catch (err) {
        console.error(err);
        setError(
          "Impossible de téléverser l’image pour l’instant. Vérifiez vos droits Supabase Storage.",
        );
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (disabled) return;
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button size="default" disabled={disabled}>
          + Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau produit</DialogTitle>
          <DialogDescription>
            Renseignez les informations principales. Les données seront enregistrées dans Supabase.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Ex. Huile d’olive bio"
              value={form.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                name="category"
                placeholder="Alimentaire, cosmétique..."
                value={form.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock disponible</Label>
              <Input
                id="stock"
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
              <Label htmlFor="status">État du stock</Label>
              <Select
                value={form.status}
                onValueChange={(value: (typeof PRODUCT_STATUSES)[number]) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
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
              <Label htmlFor="price">Prix (optionnel)</Label>
              <Input
                id="price"
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Détails du produit, provenance, remarques..."
              rows={3}
              value={form.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Photo du produit</Label>
            <label
              htmlFor="image"
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/40 px-4 py-6 text-center transition hover:border-primary/60 hover:bg-primary/5",
                previewUrl && "border-solid",
              )}
            >
              {previewUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-md">
                  <Image
                    src={previewUrl}
                    alt="Prévisualisation du produit"
                    fill
                    className="object-cover"
                  />
                </div>
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
              id="image"
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
            <Button type="submit" disabled={isPending || disabled}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer le produit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
