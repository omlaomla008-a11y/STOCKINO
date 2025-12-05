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

  // Fonction helper pour charger une image depuis une URL
  const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } else {
          reject(new Error("Impossible de créer le contexte canvas"));
        }
      };
      img.onerror = () => reject(new Error("Impossible de charger l'image"));
      img.src = url;
    });
  };

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
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const imageSize = 22; // Taille de l'image en mm
        const rowHeight = 24; // Hauteur de chaque ligne de produit (réduite)
        let yPos = margin + 5;

        // En-tête
        doc.setFontSize(16);
        doc.setFont(undefined, "bold");
        doc.text("RAPPORT DE STOCK", pageWidth / 2, yPos, { align: "center" });
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.text(
          `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
          pageWidth / 2,
          yPos,
          { align: "center" },
        );
        yPos += 8;

        // Définir les positions des colonnes (optimisées avec plus d'espace entre quantité et prix)
        const imageCol = margin + 1;
        const productCol = margin + imageSize + 5;
        const quantityCol = margin + 105;
        const priceCol = margin + 145; // Plus d'espace entre quantité et prix
        const lineEnd = pageWidth - margin;

        // Ligne de séparation avant l'en-tête
        doc.setLineWidth(0.3);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, yPos, lineEnd, yPos);
        yPos += 3;

        // En-têtes de colonnes avec fond gris
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 3, lineEnd - margin, 6, "F");
        
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("Photo", imageCol, yPos);
        doc.text("Produit", productCol, yPos);
        // Centrer les en-têtes quantité et prix
        const quantityCenter = quantityCol + (priceCol - quantityCol) / 2;
        const priceCenter = priceCol + (lineEnd - priceCol) / 2;
        doc.text("Quantité", quantityCenter, yPos, { align: "center" });
        doc.text("Prix", priceCenter, yPos, { align: "center" });
        yPos += 2;

        // Ligne de séparation sous l'en-tête
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, lineEnd, yPos);
        yPos += 3;

        // Produits
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setLineWidth(0.15);
        doc.setDrawColor(180, 180, 180);
        
        for (let i = 0; i < report.products.length; i++) {
          const product = report.products[i];
          
          // Vérifier si on doit ajouter une nouvelle page
          if (yPos + rowHeight > pageHeight - 15) {
            doc.addPage();
            yPos = margin + 5;
            // Réafficher l'en-tête sur la nouvelle page
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos - 3, lineEnd - margin, 6, "F");
            doc.setFontSize(10);
            doc.setFont(undefined, "bold");
            doc.text("Photo", imageCol, yPos);
            doc.text("Produit", productCol, yPos);
            // Centrer les en-têtes quantité et prix sur nouvelle page
            const quantityCenter = quantityCol + (priceCol - quantityCol) / 2;
            const priceCenter = priceCol + (lineEnd - priceCol) / 2;
            doc.text("Quantité", quantityCenter, yPos, { align: "center" });
            doc.text("Prix", priceCenter, yPos, { align: "center" });
            doc.setLineWidth(0.3);
            doc.line(margin, yPos + 2, lineEnd, yPos + 2);
            yPos += 5;
            doc.setFontSize(9);
            doc.setFont(undefined, "normal");
          }

          const rowTop = yPos - 2;
          const rowBottom = rowTop + rowHeight;

          // Rectangle de fond pour chaque ligne (alternance de couleurs)
          if (i % 2 === 0) {
            doc.setFillColor(255, 255, 255);
          } else {
            doc.setFillColor(248, 248, 248);
          }
          doc.rect(margin, rowTop, lineEnd - margin, rowHeight, "F");

          // Bordures de la cellule image
          doc.setDrawColor(180, 180, 180);
          doc.rect(imageCol - 1, rowTop + 1, imageSize + 2, imageSize + 2);

          // Image du produit
          if (product.image_url) {
            try {
              const imageData = await loadImage(product.image_url);
              doc.addImage(
                imageData,
                "JPEG",
                imageCol,
                rowTop + 2,
                imageSize,
                imageSize,
                undefined,
                "FAST"
              );
            } catch (error) {
              console.warn(`Impossible de charger l'image pour ${product.name}:`, error);
              // Placeholder si l'image ne charge pas
              doc.setFillColor(245, 245, 245);
              doc.rect(imageCol, rowTop + 2, imageSize, imageSize, "F");
              doc.setFontSize(7);
              doc.setTextColor(150, 150, 150);
              doc.text("N/A", imageCol + imageSize / 2, rowTop + 2 + imageSize / 2, { align: "center" });
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(9);
            }
          } else {
            // Rectangle vide si pas d'image
            doc.setFillColor(245, 245, 245);
            doc.rect(imageCol, rowTop + 2, imageSize, imageSize, "F");
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text("N/A", imageCol + imageSize / 2, rowTop + 2 + imageSize / 2, { align: "center" });
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
          }

          // Ligne verticale après l'image
          doc.setDrawColor(180, 180, 180);
          doc.line(productCol - 2, rowTop, productCol - 2, rowBottom);

          // Nom du produit (avec gestion du texte long)
          const productName = product.name.length > 40 ? product.name.substring(0, 37) + "..." : product.name;
          doc.text(productName, productCol, rowTop + 10);

          // Ligne verticale avant la quantité
          doc.line(quantityCol - 2, rowTop, quantityCol - 2, rowBottom);

          // Quantité avec "pièces" (centrée)
          doc.setFont(undefined, "bold");
          const quantityText = `${product.quantity} pièces`;
          // Calculer la position pour centrer dans la colonne (largeur de colonne = 35mm)
          const quantityCenter = quantityCol + (priceCol - quantityCol) / 2;
          doc.text(quantityText, quantityCenter, rowTop + 10, { align: "center" });
          doc.setFont(undefined, "normal");

          // Ligne verticale avant le prix
          doc.line(priceCol - 2, rowTop, priceCol - 2, rowBottom);

          // Prix avec "dirham" (centré)
          doc.setFont(undefined, "bold");
          const priceText = product.price 
            ? `${product.price.toFixed(2)} dirham`
            : "—";
          // Calculer la position pour centrer dans la colonne (largeur de colonne jusqu'à la fin)
          const priceCenter = priceCol + (lineEnd - priceCol) / 2;
          doc.text(priceText, priceCenter, rowTop + 10, { align: "center" });
          doc.setFont(undefined, "normal");

          // Ligne horizontale en bas de chaque ligne
          doc.setDrawColor(180, 180, 180);
          doc.line(margin, rowBottom, lineEnd, rowBottom);

          yPos += rowHeight;
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
        ["Détail des produits"],
        ["Produit", "Quantité", "Prix"],
        ...report.products.map((p) => [
          p.name,
          p.quantity,
          p.price ? formatCurrencySimple(p.price) : "—",
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
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const rowHeight = 24; // Hauteur de chaque ligne de vente
        let yPos = margin + 5;

        // En-tête
        doc.setFontSize(16);
        doc.setFont(undefined, "bold");
        doc.text("RAPPORT DE VENTES", pageWidth / 2, yPos, { align: "center" });
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.text(
          `Période: ${new Date(report.period.start).toLocaleDateString("fr-FR")} - ${new Date(report.period.end).toLocaleDateString("fr-FR")}`,
          pageWidth / 2,
          yPos,
          { align: "center" },
        );
        yPos += 5;
        doc.text(
          `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
          pageWidth / 2,
          yPos,
          { align: "center" },
        );
        yPos += 8;

        // Définir les positions des colonnes
        const dateCol = margin + 2;
        const referenceCol = margin + 50;
        const amountCol = margin + 120;
        const itemsCol = margin + 160;
        const lineEnd = pageWidth - margin;

        // Ligne de séparation avant l'en-tête
        doc.setLineWidth(0.3);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, yPos, lineEnd, yPos);
        yPos += 3;

        // En-têtes de colonnes avec fond gris
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 3, lineEnd - margin, 6, "F");
        
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("Date", dateCol, yPos);
        doc.text("Référence", referenceCol, yPos);
        // Centrer les en-têtes montant et items
        const amountCenter = amountCol + (itemsCol - amountCol) / 2;
        const itemsCenter = itemsCol + (lineEnd - itemsCol) / 2;
        doc.text("Montant", amountCenter, yPos, { align: "center" });
        doc.text("Items", itemsCenter, yPos, { align: "center" });
        yPos += 2;

        // Ligne de séparation sous l'en-tête
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, lineEnd, yPos);
        yPos += 3;

        // Ventes
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setLineWidth(0.15);
        doc.setDrawColor(180, 180, 180);
        
        for (let i = 0; i < report.sales.length; i++) {
          const sale = report.sales[i];
          
          // Vérifier si on doit ajouter une nouvelle page
          if (yPos + rowHeight > pageHeight - 15) {
            doc.addPage();
            yPos = margin + 5;
            // Réafficher l'en-tête sur la nouvelle page
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos - 3, lineEnd - margin, 6, "F");
            doc.setFontSize(10);
            doc.setFont(undefined, "bold");
            doc.text("Date", dateCol, yPos);
            doc.text("Référence", referenceCol, yPos);
            doc.text("Montant", amountCenter, yPos, { align: "center" });
            doc.text("Items", itemsCenter, yPos, { align: "center" });
            doc.setLineWidth(0.3);
            doc.line(margin, yPos + 2, lineEnd, yPos + 2);
            yPos += 5;
            doc.setFontSize(9);
            doc.setFont(undefined, "normal");
          }

          const rowTop = yPos - 2;
          const rowBottom = rowTop + rowHeight;

          // Rectangle de fond pour chaque ligne (alternance de couleurs)
          if (i % 2 === 0) {
            doc.setFillColor(255, 255, 255);
          } else {
            doc.setFillColor(248, 248, 248);
          }
          doc.rect(margin, rowTop, lineEnd - margin, rowHeight, "F");

          // Ligne verticale après la date
          doc.setDrawColor(180, 180, 180);
          doc.line(referenceCol - 2, rowTop, referenceCol - 2, rowBottom);

          // Date
          doc.text(
            new Date(sale.sale_date).toLocaleDateString("fr-FR"),
            dateCol,
            rowTop + 10
          );

          // Ligne verticale avant le montant
          doc.line(amountCol - 2, rowTop, amountCol - 2, rowBottom);

          // Référence (avec gestion du texte long)
          const reference = sale.reference.length > 25 ? sale.reference.substring(0, 22) + "..." : sale.reference;
          doc.text(reference, referenceCol, rowTop + 10);

          // Montant avec "dirham" (centré)
          doc.setFont(undefined, "bold");
          const amountText = `${sale.total_amount.toFixed(2)} dirham`;
          doc.text(amountText, amountCenter, rowTop + 10, { align: "center" });
          doc.setFont(undefined, "normal");

          // Ligne verticale avant les items
          doc.line(itemsCol - 2, rowTop, itemsCol - 2, rowBottom);

          // Items avec "pièces" (centré)
          doc.setFont(undefined, "bold");
          const itemsText = `${sale.items_count} pièces`;
          doc.text(itemsText, itemsCenter, rowTop + 10, { align: "center" });
          doc.setFont(undefined, "normal");

          // Ligne horizontale en bas de chaque ligne
          doc.setDrawColor(180, 180, 180);
          doc.line(margin, rowBottom, lineEnd, rowBottom);

          yPos += rowHeight;
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

        doc.save(`rapport-ventes-${startDate}-${endDate}.pdf`);
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
        ["Détail des ventes"],
        ["Date", "Référence", "Montant", "Items"],
        ...report.sales.map((sale) => [
          new Date(sale.sale_date).toLocaleDateString("fr-FR"),
          sale.reference,
          `${sale.total_amount.toFixed(2)} dirham`,
          `${sale.items_count} pièces`,
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

