"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Download, FileText, Search, Trash2, X } from "lucide-react";
import jsPDF from "jspdf";

import { CreateReceiptDialog } from "@/components/receipts/create-receipt-dialog";
import { DeleteReceiptDialog } from "@/components/receipts/delete-receipt-dialog";
import { MissingTablesNotice } from "@/components/receipts/missing-tables-notice";
import { generateInvoicePDF } from "@/lib/receipts/generate-invoice-pdf";
import { useTranslations } from "@/components/i18n/translations-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type Receipt = {
  id: string;
  organization_id: string;
  reference: string;
  type: string;
  receipt_date: string;
  created_by: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vat_rate?: number | null;
  subtotal?: number | null;
  vat_amount?: number | null;
  total_amount?: number | null;
  is_invoice?: boolean | null;
  invoice_number?: string | null;
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price?: number | null;
    product?: {
      name: string;
      category: string | null;
    };
  }>;
};

type Product = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
};

type OrganizationData = {
  name: string | null;
  settings?: {
    contact_email?: string;
  } | null;
};

type MovementsClientProps = {
  organizationId: string | null;
  initialReceipts: Receipt[];
  products: Product[];
  organization?: OrganizationData;
  hasTablesError?: boolean;
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive"> = {
  completed: "default",
  pending: "secondary",
  cancelled: "destructive",
};

// STATUS_LABELS sera maintenant géré par les traductions

export function MovementsClient({
  organizationId,
  initialReceipts,
  products,
  organization,
  hasTablesError = false,
}: MovementsClientProps) {
  const t = useTranslations("movements");
  const tCommon = useTranslations("common");
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    setReceipts(initialReceipts);
  }, [initialReceipts]);

  // Filtrer les bons
  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const matchesSearch =
        searchQuery === "" ||
        receipt.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || receipt.type === typeFilter;
      const matchesStatus = statusFilter === "all" || receipt.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [receipts, searchQuery, typeFilter, statusFilter]);

  const handleReceiptCreated = () => {
    router.refresh();
  };

  const handleReceiptDeleted = (receiptId: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    router.refresh();
  };

  const handleDownloadPDF = async (receipt: Receipt) => {
    try {
      const fullReceipt = receipts.find((r) => r.id === receipt.id);
      if (!fullReceipt || !fullReceipt.items || fullReceipt.items.length === 0) {
        alert("Impossible de générer le PDF : détails du bon introuvables.");
        return;
      }

      // Si c'est une facture, générer la facture PDF
      if (fullReceipt.is_invoice && organization) {
        await generateInvoicePDF(
          {
            reference: fullReceipt.reference,
            invoice_number: fullReceipt.invoice_number,
            receipt_date: fullReceipt.receipt_date,
            type: fullReceipt.type,
            vat_rate: fullReceipt.vat_rate,
            subtotal: fullReceipt.subtotal,
            vat_amount: fullReceipt.vat_amount,
            total_amount: fullReceipt.total_amount,
            notes: fullReceipt.notes,
            items: fullReceipt.items.map((item) => ({
              quantity: item.quantity,
              unit_price: item.unit_price,
              product: item.product,
            })),
          },
          organization,
        );
        return;
      }

      // Sinon, générer un bon classique
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // En-tête
      doc.setFontSize(18);
      doc.text("BON D'ENTRÉE/SORTIE", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`Référence: ${receipt.reference}`, margin, yPos);
      yPos += 7;
      doc.text(
        `Type: ${receipt.type === "entry" ? "ENTRÉE" : "SORTIE"}`,
        margin,
        yPos,
      );
      yPos += 7;
      doc.text(
        `Date: ${new Date(receipt.receipt_date).toLocaleDateString("fr-FR")}`,
        margin,
        yPos,
      );
      yPos += 7;
      doc.text(
        `Statut: ${receipt.status}`,
        margin,
        yPos,
      );
      yPos += 10;

      // Ligne de séparation
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Tableau des produits
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Produit", margin, yPos);
      doc.text("Quantité", pageWidth - margin - 40, yPos, { align: "right" });
      yPos += 7;

      doc.setFont(undefined, "normal");
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      fullReceipt.items.forEach((item) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = margin;
        }

        const productName = item.product?.name ?? "Produit inconnu";
        doc.text(productName, margin, yPos);
        doc.text(item.quantity.toString(), pageWidth - margin - 40, yPos, {
          align: "right",
        });
        yPos += 7;
      });

      yPos += 5;
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Notes
      if (receipt.notes) {
        doc.setFontSize(10);
        doc.text("Notes:", margin, yPos);
        yPos += 7;
        doc.setFontSize(9);
        const notesLines = doc.splitTextToSize(receipt.notes, pageWidth - 2 * margin);
        notesLines.forEach((line: string) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin, yPos);
          yPos += 5;
        });
      }

      // Pied de page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} / ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        );
        doc.text(
          `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
          pageWidth - margin,
          doc.internal.pageSize.getHeight() - 10,
          { align: "right" },
        );
      }

      // Télécharger le PDF
      doc.save(`bon-${receipt.reference}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Impossible de générer le PDF. Veuillez réessayer.");
    }
  };

  const canCreate = Boolean(organizationId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const typeLabel = (type: string) => (type === "entry" ? t("filters.entry") : t("filters.exit"));
  const statusLabel = (status: string) => {
    try {
      return t(`status.${status}` as any);
    } catch {
      return status;
    }
  };

  const hasActiveFilters =
    searchQuery !== "" || typeFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {canCreate ? (
          <CreateReceiptDialog
            organizationId={organizationId}
            products={products}
            onReceiptCreated={handleReceiptCreated}
          />
        ) : (
          <Button disabled>+ {t("add")}</Button>
        )}
      </div>

      {hasTablesError && <MissingTablesNotice />}

      {!canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("noOrganization.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("noOrganization.description")}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{tCommon("actions")}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredReceipts.length === 0
                    ? t("table.noReceipts")
                    : `${filteredReceipts.length} ${filteredReceipts.length > 1 ? t("table.countPlural") : t("table.count")}.`}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t("filters.allTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                  <SelectItem value="entry">{t("filters.entry")}</SelectItem>
                  <SelectItem value="exit">{t("filters.exit")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t("filters.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="completed">{t("status.completed")}</SelectItem>
                  <SelectItem value="pending">{t("status.pending")}</SelectItem>
                  <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="whitespace-nowrap"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("filters.reset")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {filteredReceipts.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {receipts.length === 0
                  ? t("table.noReceipts")
                  : t("table.noReceiptsFiltered")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.reference")}</TableHead>
                    <TableHead>{t("table.type")}</TableHead>
                    <TableHead>{t("table.date")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.notes")}</TableHead>
                    <TableHead className="text-right">{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.reference}</TableCell>
                      <TableCell>
                        <Badge variant={receipt.type === "entry" ? "default" : "secondary"}>
                          {typeLabel(receipt.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(receipt.receipt_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[receipt.status] ?? "secondary"}>
                          {statusLabel(receipt.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {receipt.notes ? (
                          <span className="text-sm text-muted-foreground">{receipt.notes}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {receipt.is_invoice && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(receipt)}
                              title={t("downloadInvoice")}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(receipt)}
                            title={t("downloadPDF")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DeleteReceiptDialog
                            receipt={{
                              id: receipt.id,
                              reference: receipt.reference,
                              type: receipt.type,
                              receiptDate: receipt.receipt_date,
                            }}
                            onReceiptDeleted={handleReceiptDeleted}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

