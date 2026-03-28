"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { AuthFormState } from "@/lib/auth/form-state";

const SignInSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  organizationCode: z.string().optional(),
});

const SignUpSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  company: z.string().optional(),
});

const ResetPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

export async function signInAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    organizationCode: formData.get("organizationCode"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Veuillez vérifier vos informations.",
      status: "error",
    };
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: signInData,
    error,
  } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !signInData?.user) {
    return {
      message: "Connexion impossible. Vérifiez vos identifiants.",
      status: "error",
    };
  }

  // Utiliser le client admin pour récupérer le profil (bypass RLS)
  const adminClient = getSupabaseAdminClient();

  const { data: profile } = await adminClient
    .from("profiles")
    .select(
      `
        organization_id,
        role,
        organization:organizations ( id, code )
      `,
    )
    .eq("id", signInData.user.id)
    .maybeSingle();

  const providedCode = parsed.data.organizationCode?.trim().toUpperCase();
  const profileOrgId = profile?.organization_id ?? null;
  const profileRole = (profile?.role as string | undefined) ?? null;

  // Si le profil n'existe pas OU n'a pas d'organisation_id, permettre la connexion (première connexion d'un admin)
  const isFirstLogin = !profile || !profileOrgId;

  // Si un code est fourni, vérifier qu'il correspond à l'organisation de l'utilisateur
  if (providedCode) {
    const { data: organization, error: organizationError } = await adminClient
      .from("organizations")
      .select("id, code")
      .eq("code", providedCode)
      .single();

    if (organizationError || !organization) {
      await supabase.auth.signOut();
      return {
        message: "Code d'organisation invalide.",
        status: "error",
      };
    }

    // Pour les admins ou première connexion, permettre la connexion même si le code ne correspond pas
    // Pour les autres utilisateurs, vérifier que le code correspond à leur organisation
    if (
      profileRole !== "admin" &&
      !isFirstLogin &&
      profileOrgId &&
      profileOrgId !== organization.id
    ) {
      await supabase.auth.signOut();
      return {
        message: "Votre compte n'appartient pas à cette organisation.",
        status: "error",
      };
    }
  } else {
    // Si pas de code fourni :
    // - Permettre la connexion si c'est la première connexion (pas de profil ou pas d'organisation)
    // - Permettre la connexion si l'utilisateur est admin (même s'il a une organisation)
    // - Sinon, demander le code d'organisation
    if (isFirstLogin || profileRole === "admin") {
      // Première connexion ou admin = connexion autorisée
      revalidatePath("/dashboard");
      redirect("/dashboard");
      return {
        message: "Connexion réussie.",
        status: "success",
      };
    }

    // Si le profil existe, a une organisation, et n'est pas admin, demander le code
    await supabase.auth.signOut();
    return {
      message: "Veuillez indiquer le code d'organisation pour vous connecter.",
      status: "error",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignUpSchema.safeParse({
    company: formData.get("company"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Veuillez vérifier vos informations.",
      status: "error",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        company: parsed.data.company,
      },
    },
  });

  if (error) {
    return {
      message:
        error.message === "User already registered"
          ? "Un compte existe déjà avec cet email."
          : "Impossible de créer le compte pour le moment.",
      status: "error",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function resetPasswordAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = ResetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Adresse email invalide.",
      status: "error",
    };
  }

  const supabase = await createSupabaseServerClient();

  const passwordRedirectUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/reset-password`
    : process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL.replace(/\/$/, "")}/reset-password`
      : "http://localhost:3000/reset-password";

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: passwordRedirectUrl,
  });

  if (error) {
    return {
      message: "Impossible d'envoyer le lien pour le moment.",
      status: "error",
    };
  }

  return {
    message: "Un email de réinitialisation vient d'être envoyé.",
    status: "success",
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  revalidatePath("/signin");
  revalidatePath("/dashboard");
}

// Action admin pour générer un lien de réinitialisation de mot de passe
const AdminResetPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

const AdminSetPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export async function adminResetPasswordAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState & { resetLink?: string }> {
  const parsed = AdminResetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Adresse email invalide.",
      status: "error",
    };
  }

  const adminClient = getSupabaseAdminClient();

  // Récupérer l'utilisateur par email
  const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
  
  if (listError) {
    return {
      message: "Impossible de récupérer les utilisateurs.",
      status: "error",
    };
  }

  const user = users.users.find((u) => u.email === parsed.data.email);

  if (!user) {
    return {
      message: "Aucun utilisateur trouvé avec cet email.",
      status: "error",
    };
  }

  // Générer un lien de réinitialisation avec l'URL de redirection correcte
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
    : process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL}/reset-password`
    : "http://localhost:3001/reset-password";

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: parsed.data.email,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (linkError || !linkData) {
    return {
      message: `Impossible de générer le lien: ${linkError?.message ?? "Erreur inconnue"}`,
      status: "error",
    };
  }

  return {
    message: `Lien de réinitialisation généré avec succès pour ${parsed.data.email}`,
    status: "success",
    resetLink: linkData.properties.action_link,
  };
}

// Action admin pour définir directement un nouveau mot de passe
export async function adminSetPasswordAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  // Vérifier que l'utilisateur actuel est un admin
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return {
      message: "Vous devez être connecté pour effectuer cette action.",
      status: "error",
    };
  }

  const adminClient = getSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      message: "Seuls les administrateurs peuvent définir des mots de passe.",
      status: "error",
    };
  }

  const parsed = AdminSetPasswordSchema.safeParse({
    email: formData.get("email"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Données invalides.",
      status: "error",
    };
  }

  // Récupérer l'utilisateur par email
  const { data: users, error: listError } = await adminClient.auth.admin.listUsers();

  if (listError) {
    return {
      message: "Impossible de récupérer les utilisateurs.",
      status: "error",
    };
  }

  const user = users.users.find((u) => u.email === parsed.data.email);

  if (!user) {
    return {
      message: "Aucun utilisateur trouvé avec cet email.",
      status: "error",
    };
  }

  // Définir directement le nouveau mot de passe
  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    password: parsed.data.newPassword,
  });

  if (updateError) {
    return {
      message: `Impossible de définir le mot de passe: ${updateError.message}`,
      status: "error",
    };
  }

  return {
    message: `Mot de passe défini avec succès pour ${parsed.data.email}. L'utilisateur peut maintenant se connecter avec ce nouveau mot de passe.`,
    status: "success",
  };
}
