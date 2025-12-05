"use server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export type StockReportData = {
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number | null;
    image_url: string | null;
  }>;
  totalProducts: number;
  totalStock: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
};

export type SalesReportData = {
  sales: Array<{
    id: string;
    reference: string;
    sale_date: string;
    total_amount: number;
    items_count: number;
  }>;
  totalSales: number;
  totalAmount: number;
  averageSale: number;
  period: {
    start: string;
    end: string;
  };
};

export async function getStockReport(): Promise<StockReportData | null> {
  try {
    const user = await requireUser();
    const adminClient = getSupabaseAdminClient();

    // Utiliser le client admin pour bypasser RLS
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      return null;
    }

    if (!profile?.organization_id) {
      console.error("Aucune organisation associée à l'utilisateur");
      return null;
    }

    const { data: products, error: productsError } = await adminClient
      .from("products")
      .select("id, name, quantity, price, image_url, status")
      .eq("organization_id", profile.organization_id)
      .order("name", { ascending: true });

    if (productsError) {
      console.error("Erreur lors de la récupération des produits:", productsError);
      return null;
    }

    if (!products) {
      return null;
    }

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const outOfStock = products.filter((p) => p.status === "out_of_stock").length;
    const lowStock = products.filter((p) => p.status === "low_stock").length;
    const totalValue = products.reduce(
      (sum, p) => sum + (p.price ?? 0) * p.quantity,
      0,
    );

    return {
      products,
      totalProducts,
      totalStock,
      outOfStock,
      lowStock,
      totalValue,
    };
  } catch (error) {
    console.error("Erreur inattendue lors de la génération du rapport de stock:", error);
    return null;
  }
}

export async function getSalesReport(
  startDate: string,
  endDate: string,
): Promise<SalesReportData | null> {
  try {
    const user = await requireUser();
    const adminClient = getSupabaseAdminClient();

    // Utiliser le client admin pour bypasser RLS
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      return null;
    }

    if (!profile?.organization_id) {
      console.error("Aucune organisation associée à l'utilisateur");
      return null;
    }

    const { data: sales, error: salesError } = await adminClient
    .from("sales")
    .select(
      `
      id,
      sale_date,
      total_amount,
      sales_items (id)
    `,
    )
    .eq("organization_id", profile.organization_id)
    .gte("sale_date", startDate)
    .lte("sale_date", endDate)
    .order("sale_date", { ascending: false });

    if (salesError) {
      console.error("Erreur lors de la récupération des ventes:", salesError);
      // Si la table n'existe pas, retourner un rapport vide plutôt que null
      if (
        salesError.code === "42P01" ||
        salesError.message?.includes("does not exist") ||
        salesError.message?.includes("relation") ||
        salesError.message?.includes("table")
      ) {
        return {
          sales: [],
          totalSales: 0,
          totalAmount: 0,
          averageSale: 0,
          period: {
            start: startDate,
            end: endDate,
          },
        };
      }
      return null;
    }

    if (!sales) {
      return null;
    }

    const salesWithCount = sales.map((sale) => ({
      id: sale.id,
      reference: `VTE-${sale.sale_date}-${sale.id.slice(0, 8)}`,
      sale_date: sale.sale_date,
      total_amount: sale.total_amount,
      items_count: Array.isArray(sale.sales_items) ? sale.sales_items.length : 0,
    }));

    const totalSales = salesWithCount.length;
    const totalAmount = salesWithCount.reduce((sum, s) => sum + s.total_amount, 0);
    const averageSale = totalSales > 0 ? totalAmount / totalSales : 0;

    return {
      sales: salesWithCount,
      totalSales,
      totalAmount,
      averageSale,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  } catch (error) {
    console.error("Erreur inattendue lors de la génération du rapport de ventes:", error);
    return null;
  }
}

