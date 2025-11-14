"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteSaleAction } from "@/lib/sales/actions";
import { formatCurrencySimple } from "@/lib/constants";
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

type Sale = {
  id: string;
  saleDate: string;
  totalAmount: number;
};

type DeleteSaleDialogProps = {
  sale: Sale;
  onSaleDeleted: (saleId: string) => void;
};

export function DeleteSaleDialog({ sale, onSaleDeleted }: DeleteSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      const result = await deleteSaleAction({ saleId: sale.id });

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      onSaleDeleted(sale.id);
      setOpen(false);
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la vente</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer la vente du <strong>{formatDate(sale.saleDate)}</strong>{" "}
            d'un montant de <strong>{formatCurrencySimple(sale.totalAmount)}</strong> ? Cette action est
            irréversible. Les stocks des produits seront restaurés automatiquement.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Cette action ne peut pas être annulée. Les quantités en stock seront restaurées.
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Annuler
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

