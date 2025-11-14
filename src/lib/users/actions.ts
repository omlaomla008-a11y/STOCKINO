"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { USER_ROLES } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

const createUserSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  fullName: z.string().optional(),
  role: z.enum(USER_ROLES),
});

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function inviteUserAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  // Obtenir l'utilisateur directement dans l'action
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    return {
      status: "error",
      message: "Erreur de configuration serveur.",
    };
  }

  // Vérifier que formData est bien un FormData
  if (!formData || typeof formData.get !== "function") {
    return {
      status: "error",
      message: "Erreur: données du formulaire invalides.",
    };
  }

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Informations invalides.",
    };
  }

  // Utiliser le client admin pour bypasser RLS
  const { data: currentProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !currentProfile?.organization_id ||
    currentProfile.role !== "admin"
  ) {
    return {
      status: "error",
      message: "Seuls les administrateurs peuvent créer des utilisateurs.",
    };
  }

  const baseEmail = parsed.data.email.trim();
  const password = parsed.data.password.trim();
  const fullName = parsed.data.fullName?.trim() ?? "";

  try {
    // Créer l'utilisateur avec mot de passe
    const { data, error } = await adminClient.auth.admin.createUser({
      email: baseEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company_role: parsed.data.role,
      },
    });

    if (error || !data?.user) {
      throw error ?? new Error("Création impossible (email déjà utilisé ?)");
    }

    const userId = data.user.id;

    // Créer le profil
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: userId,
        email: baseEmail,
        organization_id: currentProfile.organization_id,
        role: parsed.data.role,
        full_name: fullName || null,
      });

    if (profileError) {
      throw profileError;
    }

    revalidatePath("/settings");
    revalidatePath("/users");
    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Utilisateur créé avec succès. Communiquez-lui ses identifiants (email et mot de passe).",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message:
        error instanceof Error && error.message
          ? error.message
          : "Impossible de créer cet utilisateur.",
    };
  }
}

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(USER_ROLES),
});

export async function updateUserRoleAction(
  userId: string,
  role: (typeof USER_ROLES)[number],
): Promise<ActionResult> {
  // Obtenir l'utilisateur directement dans l'action
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    return {
      status: "error",
      message: "Erreur de configuration serveur.",
    };
  }

  const validation = updateRoleSchema.safeParse({ userId, role });
  if (!validation.success) {
    return {
      status: "error",
      message: "Rôle invalide.",
    };
  }

  // Utiliser le client admin pour bypasser RLS
  const { data: currentProfile, error: currentProfileError } = await adminClient
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (
    currentProfileError ||
    !currentProfile?.organization_id ||
    currentProfile.role !== "admin"
  ) {
    return {
      status: "error",
      message: "Seuls les administrateurs peuvent modifier les rôles.",
    };
  }

  try {
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        role,
      })
      .eq("id", userId)
      .eq("organization_id", currentProfile.organization_id);

    if (profileError) {
      throw profileError;
    }

    await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: {
        company_role: role,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/users");

    return {
      status: "success",
      message: "Rôle mis à jour.",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Impossible de modifier le rôle pour le moment.",
    };
  }
}
