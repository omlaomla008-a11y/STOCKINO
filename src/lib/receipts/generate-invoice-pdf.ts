import type jsPDF from "jspdf";
import { formatCurrencySimple } from "@/lib/constants";

type ReceiptData = {
  reference: string;
  invoice_number: string | null;
  receipt_date: string;
  type: string;
  vat_rate: number | null;
  subtotal: number | null;
  vat_amount: number | null;
  total_amount: number | null;
  notes: string | null;
  items: Array<{
    quantity: number;
    unit_price: number | null;
    product?: {
      name: string;
      category: string | null;
    };
  }>;
};

type OrganizationData = {
  name: string | null;
  settings?: {
    contact_email?: string;
  } | null;
};

export async function generateInvoicePDF(
  receipt: ReceiptData,
  organization: OrganizationData,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // En-tête de la facture
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("FACTURE", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Informations de l'organisation
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(organization.name || "Organisation", margin, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  if (organization.settings?.contact_email) {
    doc.text(`Email: ${organization.settings.contact_email}`, margin, yPos);
    yPos += 5;
  }

  // Numéro de facture et date
  doc.setFont(undefined, "bold");
  doc.text("Numéro de facture:", pageWidth - margin - 60, yPos - 15);
  doc.setFont(undefined, "normal");
  doc.text(receipt.invoice_number || receipt.reference, pageWidth - margin, yPos - 15, { align: "right" });

  doc.setFont(undefined, "bold");
  doc.text("Date:", pageWidth - margin - 60, yPos - 10);
  doc.setFont(undefined, "normal");
  const receiptDate = new Date(receipt.receipt_date).toLocaleDateString("fr-FR");
  doc.text(receiptDate, pageWidth - margin, yPos - 10, { align: "right" });

  yPos += 15;

  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Tableau des produits
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Désignation", margin, yPos);
  doc.text("Qté", margin + 80, yPos);
  doc.text("Prix unitaire", margin + 100, yPos);
  doc.text("Total HT", margin + 140, yPos);
  yPos += 5;

  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 7;

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);

  receipt.items.forEach((item) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    const productName = item.product?.name || "Produit";
    const category = item.product?.category;
    const quantity = item.quantity;
    const unitPrice = item.unit_price || 0;
    const lineTotal = quantity * unitPrice;

    // Nom du produit (peut être sur plusieurs lignes)
    const productText = category ? `${productName} (${category})` : productName;
    const lines = doc.splitTextToSize(productText, 60);
    doc.text(lines, margin, yPos);
    const textHeight = lines.length * 5;

    doc.text(quantity.toString(), margin + 80, yPos);
    doc.text(formatCurrencySimple(unitPrice), margin + 100, yPos);
    doc.text(formatCurrencySimple(lineTotal), margin + 140, yPos);

    yPos += Math.max(textHeight, 8);
  });

  yPos += 5;
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Totaux
  const subtotal = receipt.subtotal || 0;
  const vatRate = receipt.vat_rate || 0;
  const vatAmount = receipt.vat_amount || 0;
  const total = receipt.total_amount || 0;

  doc.setFontSize(10);
  doc.text("Sous-total HT:", pageWidth - margin - 60, yPos, { align: "right" });
  doc.text(formatCurrencySimple(subtotal), pageWidth - margin, yPos, { align: "right" });
  yPos += 7;

  doc.text(`TVA (${vatRate}%):`, pageWidth - margin - 60, yPos, { align: "right" });
  doc.text(formatCurrencySimple(vatAmount), pageWidth - margin, yPos, { align: "right" });
  yPos += 7;

  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("Total TTC:", pageWidth - margin - 60, yPos, { align: "right" });
  doc.text(formatCurrencySimple(total), pageWidth - margin, yPos, { align: "right" });
  yPos += 15;

  // Notes
  if (receipt.notes) {
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.text("Notes:", margin, yPos);
    yPos += 5;
    const notesLines = doc.splitTextToSize(receipt.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  // Télécharger le PDF
  const fileName = receipt.invoice_number
    ? `Facture-${receipt.invoice_number}.pdf`
    : `Facture-${receipt.reference}.pdf`;
  doc.save(fileName);
}

