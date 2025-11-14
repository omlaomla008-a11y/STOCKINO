import { UsersClient } from "./users-client";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

async function getUsersData(userId: string) {
  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser RLS
  const { data: currentProfile } = await adminClient
    .from("profiles")
    .select("organization_id, role")
    .eq("id", userId)
    .maybeSingle();

  if (!currentProfile?.organization_id) {
    return {
      users: [],
      currentUserRole: currentProfile?.role ?? null,
      canManage: false,
    };
  }

  // Récupérer tous les utilisateurs de l'organisation
  const { data: users } = await adminClient
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("organization_id", currentProfile.organization_id)
    .order("created_at", { ascending: false });

  const canManage = currentProfile.role === "admin";

  return {
    users: users ?? [],
    currentUserRole: currentProfile.role,
    canManage,
  };
}

export default async function UsersPage() {
  const user = await requireUser();
  const { users, currentUserRole, canManage } = await getUsersData(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les membres de votre organisation et leurs permissions.
          </p>
        </div>
      </div>

      <UsersClient
        initialUsers={users}
        currentUserId={user.id}
        canManage={canManage}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
