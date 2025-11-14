"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { createReceiptAction, type CreateReceiptInput, type ReceiptItemInput } from "@/lib/receipts/actions";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

type Product = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
  price: number | null;
};

type CreateReceiptDialogProps = {
  organizationId: string;
  products: Product[];
  onReceiptCreated: () => void;
  disabled?: boolean;
};

type ReceiptItem = ReceiptItemInput & {
  productName: string;
  productCategory: string | null;
};

export function CreateReceiptDialog({
  organizationId,
  products,
  onReceiptCreated,
  disabled = false,
}: CreateReceiptDialogProps) {
  const t = useTranslations("movements.dialog.add");
  const tCommon = useTranslations("common");
  const tMovements = useTranslations("movements");
  const [open, setOpen] = useState(false);
  const [receiptType, setReceiptType] = useState<"entry" | "exit">("entry");
  const [receiptDate, setReceiptDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [vatRate, setVatRate] = useState<number>(20);
  const [isInvoice, setIsInvoice] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Produits disponibles selon le type
  const availableProducts =
    receiptType === "entry"
      ? products // Pour les entrées, tous les produits sont disponibles
      : products.filter((p) => p.quantity > 0); // Pour les sorties, seulement ceux en stock

  const resetForm = () => {
    setReceiptType("entry");
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setItems([]);
    setSelectedProductId("");
    setVatRate(20);
    setIsInvoice(false);
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

    // Pour les sorties, vérifier le stock disponible
    if (receiptType === "exit") {
      const alreadyReserved = items
        .filter((item) => item.productId === selectedProductId)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (product.quantity - alreadyReserved <= 0) {
        setError(t("errorInsufficientStock"));
        return;
      }
    }

    const newItem: ReceiptItem = {
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

  const handleItemChange = (index: number, field: "quantity" | "unitPrice", value: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const product = products.find((p) => p.id === item.productId);

      if (field === "quantity") {
        if (receiptType === "exit" && product) {
          // Vérifier le stock disponible pour les sorties
          const alreadyReserved = updated
            .filter((it, i) => i !== index && it.productId === item.productId)
            .reduce((sum, it) => sum + it.quantity, 0);

        const maxAvailable = product.quantity - alreadyReserved;
        if (value > maxAvailable) {
          setError(`${t("errorStockAvailable")}: ${maxAvailable}`);
          return prev;
        }
        }

        if (value <= 0) {
          return prev;
        }
      }

      if (field === "unitPrice" && value < 0) {
        return prev;
      }

      updated[index] = {
        ...item,
        [field]: value,
      };
      return updated;
    });
    setError(null);
  };

  // Calculer les totaux
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError(t("error"));
      return;
    }

    startTransition(async () => {
      const input: CreateReceiptInput = {
        organizationId,
        type: receiptType,
        receiptDate,
        items: items.map(({ productName, productCategory, ...item }) => item),
        notes: notes.trim() || null,
        vatRate,
        isInvoice,
      };

      const result = await createReceiptAction(input);

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      onReceiptCreated();
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
          + {tMovements("add")}
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
              <Label>{t("type")}</Label>
              <RadioGroup value={receiptType} onValueChange={(v) => setReceiptType(v as typeof receiptType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entry" id="entry" />
                  <Label htmlFor="entry" className="font-normal cursor-pointer">
                    {t("typeEntry")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exit" id="exit" />
                  <Label htmlFor="exit" className="font-normal cursor-pointer">
                    {t("typeExit")}
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptDate">{t("date")}</Label>
              <Input
                id="receiptDate"
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
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
                      {receiptType === "exit"
                        ? t("noProductsStock")
                        : t("noProductsAvailable")}
                    </div>
                  ) : (
                    availableProducts.map((product) => {
                      const alreadyInList = items.some((item) => item.productId === product.id);
                      const alreadyReserved =
                        receiptType === "exit"
                          ? items
                              .filter((item) => item.productId === product.id)
                              .reduce((sum, item) => sum + item.quantity, 0)
                          : 0;
                      const available =
                        receiptType === "exit" ? product.quantity - alreadyReserved : product.quantity;

                      return (
                        <SelectItem
                          key={product.id}
                          value={product.id}
                          disabled={alreadyInList || (receiptType === "exit" && available <= 0)}
                        >
                          {product.name}
                          {receiptType === "exit" && ` - Stock: ${available}`}
                          {product.category && ` (${product.category})`}
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
                      const alreadyReserved =
                        receiptType === "exit"
                          ? items
                              .filter((it, i) => i !== index && it.productId === item.productId)
                              .reduce((sum, it) => sum + it.quantity, 0)
                          : 0;
                      const maxAvailable =
                        receiptType === "exit" && product ? product.quantity - alreadyReserved : undefined;
                      const itemSubtotal = item.quantity * item.unitPrice;

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
                            {receiptType === "exit" && maxAvailable !== undefined && (
                              <p className="text-xs text-muted-foreground">{tCommon("max")}: {maxAvailable}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(index, "unitPrice", Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-24"
                              required
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrencySimple(itemSubtotal)}
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
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{t("subtotalHT")}:</span>
                    <span className="font-medium">{formatCurrencySimple(calculateTotals().subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{t("vat")} ({vatRate}%):</span>
                    <span className="font-medium">{formatCurrencySimple(calculateTotals().vatAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-base border-t pt-1">
                    <span className="font-semibold">{t("totalTTC")}:</span>
                    <span className="font-bold text-lg">{formatCurrencySimple(calculateTotals().total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vatRate">{t("vatRate")}</Label>
              <Input
                id="vatRate"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={vatRate}
                onChange={(e) => setVatRate(Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="isInvoice"
                checked={isInvoice}
                onCheckedChange={(checked) => setIsInvoice(checked === true)}
              />
              <Label htmlFor="isInvoice" className="font-normal cursor-pointer">
                {t("generateInvoice")}
              </Label>
            </div>
          </div>

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

