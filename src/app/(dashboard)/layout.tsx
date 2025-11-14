import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser les politiques RLS qui causent la récursion
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select(
      `
      email,
      full_name,
      role,
      avatar_url,
      organization_id,
      organization:organizations (
        id,
        name,
        code
      )
    `,
    )
    .eq("id", user.id)
    .single();

  // Log pour déboguer
  if (profileError) {
    console.error("Erreur lors de la récupération du profil:", profileError);
  }

  const profileSummary = {
    email: profile?.email ?? user.email ?? "utilisateur@inconnu",
    full_name: profile?.full_name ?? null,
    role: profile?.role ?? null,
    avatar_url: profile?.avatar_url ?? null,
    organization_name: profile?.organization?.name ?? null,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar profile={profileSummary} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

