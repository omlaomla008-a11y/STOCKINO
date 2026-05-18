import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export async function requireHubAdmin() {
  const user = await requireUser();
  const adminClient = getSupabaseAdminClient();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { user, adminClient };
}
