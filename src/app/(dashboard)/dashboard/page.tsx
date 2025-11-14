import { DashboardClient } from "./dashboard-client";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser RLS
  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  const organizationId = profile?.organization_id ?? null;

  let stats = null;

  if (organizationId) {
    // Statistiques des produits
    const { data: products } = await adminClient
      .from("products")
      .select("id, name, quantity, status")
      .eq("organization_id", organizationId);

    const totalProducts = products?.length ?? 0;
    const totalStock = products?.reduce((sum, p) => sum + p.quantity, 0) ?? 0;
    const outOfStock = products?.filter((p) => p.status === "out_of_stock").length ?? 0;
    const lowStock = products?.filter((p) => p.status === "low_stock").length ?? 0;
    const lowStockProducts =
      products?.filter((p) => p.status === "low_stock" || p.status === "out_of_stock") ?? [];

    // Ventes du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const { data: todaySales } = await adminClient
      .from("sales")
      .select("id, total_amount")
      .eq("organization_id", organizationId)
      .gte("sale_date", todayStr);

    const todaySalesCount = todaySales?.length ?? 0;
    const todaySalesAmount = todaySales?.reduce((sum, s) => sum + s.total_amount, 0) ?? 0;

    // Ventes du mois
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];

    const { data: monthlySales } = await adminClient
      .from("sales")
      .select("id, total_amount")
      .eq("organization_id", organizationId)
      .gte("sale_date", firstDayStr);

    const monthlySalesCount = monthlySales?.length ?? 0;
    const monthlySalesAmount = monthlySales?.reduce((sum, s) => sum + s.total_amount, 0) ?? 0;

    // Ventes récentes (5 dernières)
    const { data: recentSales } = await adminClient
      .from("sales")
      .select("id, sale_date, total_amount")
      .eq("organization_id", organizationId)
      .order("sale_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    stats = {
      totalProducts,
      outOfStock,
      lowStock,
      totalStock,
      todaySales: {
        count: todaySalesCount,
        amount: todaySalesAmount,
      },
      monthlySales: {
        count: monthlySalesCount,
        amount: monthlySalesAmount,
      },
      recentSales: recentSales ?? [],
      lowStockProducts: lowStockProducts.slice(0, 5),
    };
  }

  return <DashboardClient organizationId={organizationId} initialStats={stats} />;
}
