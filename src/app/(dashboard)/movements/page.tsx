import { MovementsClient } from "./movements-client";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const user = await requireUser();
  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser RLS
  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  const organizationId = profile?.organization_id ?? null;

  let hasTablesError = false;
  let receipts:
    | {
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
      }[]
    | null = null;

  let products:
    | {
        id: string;
        name: string;
        quantity: number;
        category: string | null;
        price: number | null;
      }[]
    | null = null;

  if (organizationId) {
    try {
      // Récupérer les bons avec leurs items
      const { data: receiptsData, error: receiptsError } = await adminClient
        .from("receipts")
        .select(
          `
          id,
          organization_id,
          reference,
          type,
          receipt_date,
          created_by,
          status,
          notes,
          created_at,
          updated_at,
          vat_rate,
          subtotal,
          vat_amount,
          total_amount,
          is_invoice,
          invoice_number,
          receipt_items (
            id,
            product_id,
            quantity,
            unit_price,
            product:products (
              name,
              category
            )
          )
        `,
        )
        .eq("organization_id", organizationId)
        .order("receipt_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (receiptsError) {
        console.error("Erreur lors de la récupération des bons:", receiptsError);
        // Si la table n'existe pas, on continue avec un tableau vide
        if (
          receiptsError.code === "42P01" ||
          receiptsError.message?.includes("does not exist") ||
          receiptsError.message?.includes("relation") ||
          receiptsError.message?.includes("table")
        ) {
          receipts = [];
          hasTablesError = true;
        } else {
          throw receiptsError;
        }
      } else {
        receipts = receiptsData;
      }

      // Récupérer les produits pour le formulaire de création
      const { data: productsData, error: productsError } = await adminClient
        .from("products")
        .select("id, name, quantity, category, price")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      if (productsError) {
        console.error("Erreur lors de la récupération des produits:", productsError);
        products = [];
      } else {
        products = productsData;
      }
    } catch (error) {
      console.error("Erreur dans MovementsPage:", error);
      receipts = [];
      products = [];
    }
  }

  // Récupérer les données de l'organisation
  let organization: { name: string | null; settings?: { contact_email?: string } | null } | null = null;

  if (organizationId) {
    try {
      const { data: orgData } = await adminClient
        .from("organizations")
        .select("name, settings")
        .eq("id", organizationId)
        .single();

      organization = orgData ?? null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'organisation:", error);
    }
  }

  return (
    <MovementsClient
      organizationId={organizationId}
      initialReceipts={receipts ?? []}
      products={products ?? []}
      organization={organization}
      hasTablesError={hasTablesError}
    />
  );
}


