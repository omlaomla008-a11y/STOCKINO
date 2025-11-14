import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "@/components/settings/organization-form";
import { TeamMembersCard } from "@/components/settings/team-members-card";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

async function getSettingsData(userId: string) {
  const adminClient = getSupabaseAdminClient();

  // Utiliser le client admin pour bypasser les politiques RLS
  const { data: profile } = await adminClient
    .from("profiles")
    .select(
      `
        id,
        email,
        full_name,
        role,
        organization_id,
        organization:organizations (
          id,
          name,
          code,
          settings
        )
      `,
    )
    .eq("id", userId)
    .single();

  let members: Array<{ id: string; full_name: string | null; email: string; role: string }> = [];

  if (profile?.organization_id) {
    const { data } = await adminClient
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: true });

    members = data ?? [];
  }

  return { profile, members };
}

export default async function SettingsPage() {
  const user = await requireUser();
  const { profile, members } = await getSettingsData(user.id);

  const organization = profile?.organization ?? null;
  const organizationCode = organization?.code ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Configurez votre organisation et gérez les membres de votre équipe.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
            <CardDescription>
              {organization
                ? "Modifiez les informations de votre organisation."
                : "Créez votre organisation pour commencer à gérer vos stocks."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationForm
              defaultName={organization?.name ?? ""}
              defaultContactEmail={
                (organization?.settings as { contact_email?: string } | null)?.contact_email ?? ""
              }
              role={profile?.role}
              code={organizationCode}
            />
          </CardContent>
        </Card>

        <TeamMembersCard
          members={members.map((member) => ({
            ...member,
            isCurrent: member.id === profile?.id,
          }))}
          canManage={profile?.role === "admin"}
          organizationCode={organizationCode}
          organizationName={organization?.name}
        />
      </div>
    </div>
  );
}
