import { SalesClient } from "./sales-client";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const user = await requireUser();
  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser RLS
  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  const organizationId = profile?.organization_id ?? null;

  let sales:
    | {
        id: string;
        organization_id: string;
        sale_date: string;
        total_amount: number;
        created_by: string;
        notes: string | null;
        created_at: string;
        updated_at: string;
      }[]
    | null = null;

  let products:
    | {
        id: string;
        name: string;
        price: number | null;
        quantity: number;
        category: string | null;
      }[]
    | null = null;

  if (organizationId) {
    // Récupérer les ventes
    const { data: salesData } = await adminClient
      .from("sales")
      .select("id, organization_id, sale_date, total_amount, created_by, notes, created_at, updated_at")
      .eq("organization_id", organizationId)
      .order("sale_date", { ascending: false })
      .order("created_at", { ascending: false });

    sales = salesData;

    // Récupérer les produits pour le formulaire de création
    const { data: productsData } = await adminClient
      .from("products")
      .select("id, name, price, quantity, category")
      .eq("organization_id", organizationId)
      .order("name", { ascending: true });

    products = productsData;
  }

  return (
    <SalesClient
      organizationId={organizationId}
      initialSales={sales ?? []}
      products={products ?? []}
    />
  );
}


