"use client";

import { useState, useTransition } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

import { getStockReport, getSalesReport, type StockReportData, type SalesReportData } from "@/lib/reports/actions";
import { formatCurrencySimple, formatCurrency } from "@/lib/constants";
import { useTranslations } from "@/components/i18n/translations-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ReportsClientProps = {
  organizationId: string | null;
};

export function ReportsClient({ organizationId }: ReportsClientProps) {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Premier jour du mois
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [isGenerating, startTransition] = useTransition();

  const handleGenerateStockPDF = () => {
    startTransition(async () => {
      try {
        const report = await getStockReport();
        if (!report) {
          alert("Impossible de générer le rapport de stock.");
          return;
        }

        const { default: jsPDF } = await import("jspdf");
        const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // En-tête
      doc.setFontSize(18);
      doc.text("RAPPORT DE STOCK", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(12);
      doc.text(
        `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
        pageWidth / 2,
        yPos,
        { align: "center" },
      );
      yPos += 15;

      // Statistiques
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Résumé", margin, yPos);
      yPos += 7;

      doc.setFont(undefined, "normal");
      doc.text(`Total produits: ${report.totalProducts}`, margin, yPos);
      yPos += 6;
      doc.text(`Stock total: ${report.totalStock} unités`, margin, yPos);
      yPos += 6;
      doc.text(`Valeur totale: ${formatCurrency(report.totalValue)}`, margin, yPos);
      yPos += 6;
      doc.text(`Ruptures de stock: ${report.outOfStock}`, margin, yPos);
      yPos += 6;
      doc.text(`Seuil d'alerte: ${report.lowStock}`, margin, yPos);
      yPos += 10;

      // Tableau des produits
      doc.setFont(undefined, "bold");
      doc.text("Détail des produits", margin, yPos);
      yPos += 7;

      doc.setFontSize(8);
      doc.setFont(undefined, "bold");
      doc.text("Produit", margin, yPos);
      doc.text("Catégorie", margin + 60, yPos);
      doc.text("Stock", margin + 100, yPos);
      doc.text("Prix", margin + 120, yPos);
      doc.text("Valeur", margin + 150, yPos);
      doc.text("Statut", margin + 180, yPos);
      yPos += 5;

      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      doc.setFont(undefined, "normal");
      report.products.forEach((product) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = margin;
        }

        doc.text(product.name.substring(0, 25), margin, yPos);
        doc.text(product.category?.substring(0, 15) ?? "—", margin + 60, yPos);
        doc.text(product.quantity.toString(), margin + 100, yPos);
        doc.text(
          product.price ? formatCurrencySimple(product.price) : "—",
          margin + 120,
          yPos,
        );
        doc.text(
          formatCurrencySimple((product.price ?? 0) * product.quantity),
          margin + 150,
          yPos,
        );
        doc.text(product.status, margin + 180, yPos);
        yPos += 6;
      });

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
      }

      doc.save(`rapport-stock-${new Date().toISOString().split("T")[0]}.pdf`);
      } catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
        alert("Erreur lors de la génération du rapport. Vérifiez la console pour plus de détails.");
      }
    });
  };

  const handleGenerateStockExcel = () => {
    startTransition(async () => {
      try {
        const report = await getStockReport();
        if (!report) {
          alert("Impossible de générer le rapport de stock.");
          return;
        }

        const XLSX = await import("xlsx");

        const worksheetData = [
        ["RAPPORT DE STOCK"],
        [`Généré le ${new Date().toLocaleDateString("fr-FR")}`],
        [],
        ["Résumé"],
        ["Total produits", report.totalProducts],
        ["Stock total", `${report.totalStock} unités`],
        ["Valeur totale", formatCurrency(report.totalValue)],
        ["Ruptures de stock", report.outOfStock],
        ["Seuil d'alerte", report.lowStock],
        [],
        ["Détail des produits"],
        ["Produit", "Catégorie", "Stock", "Prix", "Valeur", "Statut"],
        ...report.products.map((p) => [
          p.name,
          p.category ?? "—",
          p.quantity,
          p.price ? formatCurrencySimple(p.price) : "—",
          formatCurrencySimple((p.price ?? 0) * p.quantity),
          p.status,
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport Stock");

      XLSX.writeFile(workbook, `rapport-stock-${new Date().toISOString().split("T")[0]}.xlsx`);
      } catch (error) {
        console.error("Erreur lors de la génération du Excel:", error);
        alert("Erreur lors de la génération du rapport. Vérifiez la console pour plus de détails.");
      }
    });
  };

  const handleGenerateSalesPDF = () => {
    startTransition(async () => {
      try {
        const report = await getSalesReport(startDate, endDate);
        if (!report) {
          alert("Impossible de générer le rapport de ventes. Vérifiez que la table 'sales' existe dans Supabase.");
          return;
        }

        const { default: jsPDF } = await import("jspdf");
        const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // En-tête
      doc.setFontSize(18);
      doc.text("RAPPORT DE VENTES", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(12);
      doc.text(
        `Période: ${new Date(report.period.start).toLocaleDateString("fr-FR")} - ${new Date(report.period.end).toLocaleDateString("fr-FR")}`,
        pageWidth / 2,
        yPos,
        { align: "center" },
      );
      yPos += 7;
      doc.text(
        `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
        pageWidth / 2,
        yPos,
        { align: "center" },
      );
      yPos += 15;

      // Statistiques
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Résumé", margin, yPos);
      yPos += 7;

      doc.setFont(undefined, "normal");
      doc.text(`Nombre de ventes: ${report.totalSales}`, margin, yPos);
      yPos += 6;
      doc.text(`Montant total: ${formatCurrency(report.totalAmount)}`, margin, yPos);
      yPos += 6;
      doc.text(`Panier moyen: ${formatCurrency(report.averageSale)}`, margin, yPos);
      yPos += 10;

      // Tableau des ventes
      if (report.sales.length > 0) {
        doc.setFont(undefined, "bold");
        doc.text("Détail des ventes", margin, yPos);
        yPos += 7;

        doc.setFontSize(8);
        doc.setFont(undefined, "bold");
        doc.text("Date", margin, yPos);
        doc.text("Référence", margin + 40, yPos);
        doc.text("Montant", margin + 100, yPos);
        doc.text("Items", margin + 150, yPos);
        yPos += 5;

        doc.setLineWidth(0.2);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;

        doc.setFont(undefined, "normal");
        report.sales.forEach((sale) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = margin;
          }

          doc.text(
            new Date(sale.sale_date).toLocaleDateString("fr-FR"),
            margin,
            yPos,
          );
          doc.text(sale.reference.substring(0, 20), margin + 40, yPos);
          doc.text(formatCurrencySimple(sale.total_amount), margin + 100, yPos);
          doc.text(sale.items_count.toString(), margin + 150, yPos);
          yPos += 6;
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
      }

      doc.save(
        `rapport-ventes-${startDate}-${endDate}.pdf`,
      );
      } catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
        alert("Erreur lors de la génération du rapport. Vérifiez la console pour plus de détails.");
      }
    });
  };

  const handleGenerateSalesExcel = () => {
    startTransition(async () => {
      try {
        const report = await getSalesReport(startDate, endDate);
        if (!report) {
          alert("Impossible de générer le rapport de ventes. Vérifiez que la table 'sales' existe dans Supabase.");
          return;
        }

        const XLSX = await import("xlsx");

        const worksheetData = [
        ["RAPPORT DE VENTES"],
        [
          `Période: ${new Date(report.period.start).toLocaleDateString("fr-FR")} - ${new Date(report.period.end).toLocaleDateString("fr-FR")}`,
        ],
        [`Généré le ${new Date().toLocaleDateString("fr-FR")}`],
        [],
        ["Résumé"],
        ["Nombre de ventes", report.totalSales],
        ["Montant total", formatCurrency(report.totalAmount)],
        ["Panier moyen", formatCurrency(report.averageSale)],
        [],
        ["Détail des ventes"],
        ["Date", "Référence", "Montant", "Items"],
        ...report.sales.map((sale) => [
          new Date(sale.sale_date).toLocaleDateString("fr-FR"),
          sale.reference,
          formatCurrencySimple(sale.total_amount),
          sale.items_count,
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport Ventes");

      XLSX.writeFile(
        workbook,
        `rapport-ventes-${startDate}-${endDate}.xlsx`,
      );
      } catch (error) {
        console.error("Erreur lors de la génération du Excel:", error);
        alert("Erreur lors de la génération du rapport. Vérifiez la console pour plus de détails.");
      }
    });
  };

  if (!organizationId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("description")}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("stock.title")}</CardTitle>
            <CardDescription>
              {t("stock.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateStockPDF}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon("pending")}
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    {t("stock.exportPDF")}
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerateStockExcel}
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon("pending")}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t("stock.exportExcel")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sales.title")}</CardTitle>
            <CardDescription>
              {t("sales.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("sales.startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t("sales.endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateSalesPDF}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon("pending")}
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    {t("sales.exportPDF")}
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerateSalesExcel}
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon("pending")}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t("sales.exportExcel")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

