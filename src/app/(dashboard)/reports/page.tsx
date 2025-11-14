import { ReportsClient } from "@/components/reports/reports-client";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  let organizationId: string | null = null;

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
    } else {
      organizationId = profile?.organization_id ?? null;
    }
  } catch (authError) {
    console.error("Erreur d'authentification dans ReportsPage:", authError);
  }

  return <ReportsClient organizationId={organizationId} />;
}


