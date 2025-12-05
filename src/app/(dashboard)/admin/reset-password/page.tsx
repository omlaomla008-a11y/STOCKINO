import { redirect } from "next/navigation";
import { AdminResetPasswordClient } from "./admin-reset-password-client";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export default async function AdminResetPasswordPage() {
  const user = await requireUser();
  const adminClient = getSupabaseAdminClient();

  // Vérifier que l'utilisateur est un admin
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminResetPasswordClient />;
}

