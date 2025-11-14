"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";

import { createSaleAction, type CreateSaleInput, type SaleItemInput } from "@/lib/sales/actions";
import { formatCurrencySimple } from "@/lib/constants";
import { useTranslations } from "@/components/i18n/translations-provider";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Product = {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
  category: string | null;
};

type CreateSaleDialogProps = {
  organizationId: string;
  products: Product[];
  onSaleCreated: () => void;
  disabled?: boolean;
};

type SaleItem = SaleItemInput & {
  productName: string;
  productCategory: string | null;
};

export function CreateSaleDialog({
  organizationId,
  products,
  onSaleCreated,
  disabled = false,
}: CreateSaleDialogProps) {
  const t = useTranslations("sales.dialog.add");
  const tCommon = useTranslations("common");
  const tSales = useTranslations("sales");
  const [open, setOpen] = useState(false);
  const [saleDate, setSaleDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Produits disponibles (en stock)
  const availableProducts = products.filter((p) => p.quantity > 0);

  const resetForm = () => {
    setSaleDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setItems([]);
    setSelectedProductId("");
    setError(null);
  };

  const handleAddItem = () => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Vérifier si le produit est déjà dans la liste
    if (items.some((item) => item.productId === selectedProductId)) {
      setError(t("errorAlreadyInList"));
      return;
    }

    // Vérifier le stock disponible
    const alreadyReserved = items
      .filter((item) => item.productId === selectedProductId)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (product.quantity - alreadyReserved <= 0) {
      setError(t("errorInsufficientStock"));
      return;
    }

    const newItem: SaleItem = {
      productId: selectedProductId,
      quantity: 1,
      unitPrice: product.price ?? 0,
      productName: product.name,
      productCategory: product.category,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedProductId("");
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SaleItemInput, value: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const product = products.find((p) => p.id === item.productId);

      if (field === "quantity") {
        // Vérifier le stock disponible
        const alreadyReserved = updated
          .filter((it, i) => i !== index && it.productId === item.productId)
          .reduce((sum, it) => sum + it.quantity, 0);

        const maxAvailable = product ? product.quantity - alreadyReserved : 0;
        if (value > maxAvailable) {
          setError(`Stock disponible: ${maxAvailable}`);
          return prev;
        }
        if (value <= 0) {
          return prev;
        }
      }

      updated[index] = {
        ...item,
        [field]: value,
      };
      return updated;
    });
    setError(null);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Ajoutez au moins un produit à la vente.");
      return;
    }

    startTransition(async () => {
      const input: CreateSaleInput = {
        organizationId,
        saleDate,
        items: items.map(({ productName, productCategory, ...item }) => item),
        notes: notes.trim() || null,
      };

      const result = await createSaleAction(input);

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      onSaleCreated();
      setOpen(false);
      resetForm();
    });
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" disabled={disabled}>
          + {tSales("add")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="saleDate">{t("date")}</Label>
              <Input
                id="saleDate"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("addProduct")}</Label>
            <div className="flex gap-2">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {t("noProducts")}
                    </div>
                  ) : (
                    availableProducts.map((product) => {
                      const alreadyInList = items.some((item) => item.productId === product.id);
                      const alreadyReserved = items
                        .filter((item) => item.productId === product.id)
                        .reduce((sum, item) => sum + item.quantity, 0);
                      const available = product.quantity - alreadyReserved;

                      return (
                        <SelectItem
                          key={product.id}
                          value={product.id}
                          disabled={alreadyInList || available <= 0}
                        >
                          {product.name} - Stock: {available} -{" "}
                          {product.price ? formatCurrencySimple(product.price) : "Prix non défini"}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId || isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              <Label>{t("products")}</Label>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("product")}</TableHead>
                      <TableHead>{t("quantity")}</TableHead>
                      <TableHead>{t("unitPrice")}</TableHead>
                      <TableHead>{t("subtotal")}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const product = products.find((p) => p.id === item.productId);
                      const alreadyReserved = items
                        .filter((it, i) => i !== index && it.productId === item.productId)
                        .reduce((sum, it) => sum + it.quantity, 0);
                      const maxAvailable = product ? product.quantity - alreadyReserved : 0;

                      return (
                        <TableRow key={`${item.productId}-${index}`}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{item.productName}</div>
                              {item.productCategory && (
                                <div className="text-xs text-muted-foreground">
                                  {item.productCategory}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              max={maxAvailable}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, "quantity", Number.parseInt(e.target.value, 10))
                              }
                              className="w-20"
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              {t("max")}: {maxAvailable}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(index, "unitPrice", Number.parseFloat(e.target.value))
                              }
                              className="w-24"
                              required
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrencySimple(item.quantity * item.unitPrice)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end border-t pt-2">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t("total")}</p>
                  <p className="text-2xl font-semibold">{formatCurrencySimple(calculateTotal())}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("notesPlaceholder")}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                {tCommon("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || items.length === 0}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("pending")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

