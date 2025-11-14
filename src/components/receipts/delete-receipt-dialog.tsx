"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteReceiptAction } from "@/lib/receipts/actions";
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

type Receipt = {
  id: string;
  reference: string;
  type: string;
  receiptDate: string;
};

type DeleteReceiptDialogProps = {
  receipt: Receipt;
  onReceiptDeleted: (receiptId: string) => void;
};

export function DeleteReceiptDialog({ receipt, onReceiptDeleted }: DeleteReceiptDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      const result = await deleteReceiptAction({ receiptId: receipt.id });

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      onReceiptDeleted(receipt.id);
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

  const typeLabel = receipt.type === "entry" ? "Entrée" : "Sortie";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le bon</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le bon <strong>{receipt.reference}</strong> ({typeLabel}) du{" "}
            <strong>{formatDate(receipt.receiptDate)}</strong> ? Cette action est irréversible. Les stocks
            seront restaurés automatiquement.
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

