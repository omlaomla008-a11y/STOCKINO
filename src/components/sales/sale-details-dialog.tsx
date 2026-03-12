"use client";

import { useEffect, useState, useTransition } from "react";
import { Calendar, Info } from "lucide-react";

import {
  getSaleDetailsAction,
  type SaleDetailsItem,
  type SaleDetailsResult,
} from "@/lib/sales/actions";
import { formatCurrencySimple } from "@/lib/constants";
import { useTranslations } from "@/components/i18n/translations-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SaleSummary = {
  id: string;
  saleDate: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
};

type SaleDetailsDialogProps = {
  sale: SaleSummary;
};

export function SaleDetailsDialog({ sale }: SaleDetailsDialogProps) {
  const t = useTranslations("sales.dialog.details");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SaleDetailsItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!open || items || isPending) return;

    startTransition(async () => {
      setError(null);
      const result: SaleDetailsResult = await getSaleDetailsAction({ saleId: sale.id });

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      setItems(result.items);
    });
  }, [open, items, isPending, sale.id, startTransition]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          <Info className="mr-2 h-4 w-4" />
          {t("open")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(sale.saleDate)}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t("total")}</p>
              <p className="text-xl font-semibold">{formatCurrencySimple(sale.totalAmount)}</p>
            </div>
          </div>

          {sale.notes ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{tCommon("notes")}:</span> {sale.notes}
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : isPending && !items ? (
            <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
          ) : items && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noItems")}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("products")}</p>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("product")}</TableHead>
                      <TableHead>{t("quantity")}</TableHead>
                      <TableHead>{t("unitPrice")}</TableHead>
                      <TableHead>{t("subtotal")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items?.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            {item.productCategory && (
                              <div className="text-xs text-muted-foreground">
                                {item.productCategory}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrencySimple(item.unitPrice)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrencySimple(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

