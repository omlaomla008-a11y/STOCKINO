import { ProductsClient } from "./products-client";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const user = await requireUser();
  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser RLS
  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  const organizationId = profile?.organization_id ?? null;

  let products:
    | {
        id: string;
        organization_id: string;
        name: string;
        category: string | null;
        description: string | null;
        status: string;
        quantity: number;
        price: number | null;
        image_url: string | null;
        created_at: string;
        updated_at: string;
      }[]
    | [] = [];

  if (organizationId) {
    const { data } = await adminClient
      .from("products")
      .select(
        "id, organization_id, name, category, description, status, quantity, price, image_url, created_at, updated_at",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    products = data ?? [];
  }

  return (
    <ProductsClient
      organizationId={organizationId}
      initialProducts={products}
    />
  );
}
