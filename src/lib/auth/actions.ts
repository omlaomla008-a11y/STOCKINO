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
  const profileOrgCode = profile?.organization?.code ?? null;

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

    // Pour les admins, permettre la connexion même si le code ne correspond pas
    // Pour les autres utilisateurs, vérifier que le code correspond à leur organisation
    if (
      profileRole !== "admin" &&
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
    // Si pas de code fourni, seuls les admins peuvent se connecter
    // Si le profil n'existe pas encore, permettre la connexion (première connexion)
    if (!profile) {
      // Pas de profil = première connexion, on permet
      revalidatePath("/dashboard");
      redirect("/dashboard");
      return {
        message: "Connexion réussie.",
        status: "success",
      };
    }

    if (profileRole !== "admin") {
      await supabase.auth.signOut();
      return {
        message: "Veuillez indiquer le code d'organisation pour vous connecter.",
        status: "error",
      };
    }
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
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ?? "http://localhost:3001/reset-password",
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
