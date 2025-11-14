"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { OrganizationFormState } from "@/lib/organization/form-state";

const organizationSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis." })
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(80, "Le nom est trop long."),
  contactEmail: z
    .string()
    .email("Email de contact invalide")
    .optional()
    .or(z.literal("")),
});

// Générer un code alphanumérique unique de 6 caractères
const generateOrganizationCode = async (): Promise<string> => {
  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    throw new Error("Client admin non disponible");
  }

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclure les caractères ambigus
  let code: string;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const { data } = await adminClient
      .from("organizations")
      .select("code")
      .eq("code", code)
      .maybeSingle();

    exists = !!data;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error("Impossible de générer un code unique");
  }

  return code!;
};

export async function upsertOrganizationAction(
  _prevState: OrganizationFormState | undefined,
  formData: FormData,
): Promise<OrganizationFormState> {
  try {
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

    const parsed = organizationSchema.safeParse({
      name: formData.get("name"),
      contactEmail: formData.get("contactEmail"),
    });

    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Les informations fournies sont invalides.",
      };
    }

    // Récupérer le profil existant avec le client admin
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id, organization_id, email")
      .eq("id", user.id)
      .maybeSingle();

    const contactEmail =
      parsed.data.contactEmail && parsed.data.contactEmail.length > 0
        ? parsed.data.contactEmail
        : null;

    if (existingProfile?.organization_id) {
      // Mise à jour de l'organisation existante
      const { error: updateError } = await adminClient
        .from("organizations")
        .update({
          name: parsed.data.name,
          settings: {
            contact_email: contactEmail,
          },
        })
        .eq("id", existingProfile.organization_id);

      if (updateError) {
        throw updateError;
      }

      revalidatePath("/settings", "page");
      revalidatePath("/dashboard", "page");
      revalidatePath("/", "layout");

      return {
        status: "success",
        message: "Organisation mise à jour avec succès.",
      };
    } else {
      // Création d'une nouvelle organisation
      const code = await generateOrganizationCode();

      const { data: newOrg, error: insertError } = await adminClient
        .from("organizations")
        .insert({
          name: parsed.data.name,
          code,
          settings: {
            contact_email: contactEmail,
          },
        })
        .select("id, code")
        .single();

      if (insertError || !newOrg) {
        throw insertError ?? new Error("Impossible de créer l'organisation.");
      }

      // Mettre à jour le profil avec le client admin (bypass RLS)
      // Utiliser update si le profil existe, sinon insert
      if (existingProfile) {
        // Le profil existe, on le met à jour
        const { error: updateProfileError } = await adminClient
          .from("profiles")
          .update({
            organization_id: newOrg.id,
            role: "admin",
          })
          .eq("id", user.id);

        if (updateProfileError) {
          console.error("Erreur update profil:", updateProfileError);
          // Ne pas throw, on continue pour vérifier
        }
      } else {
        // Le profil n'existe pas, on le crée
        const { error: insertProfileError } = await adminClient
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email ?? "",
            organization_id: newOrg.id,
            role: "admin",
          });

        if (insertProfileError) {
          console.error("Erreur insert profil:", insertProfileError);
          // Ne pas throw, on continue pour vérifier
        }
      }

      // Vérification finale avec le client admin
      const { data: finalProfile, error: verifyError } = await adminClient
        .from("profiles")
        .select("id, organization_id, role")
        .eq("id", user.id)
        .single();

      if (verifyError) {
        console.error("Erreur vérification profil:", verifyError);
        // Si la vérification échoue, on retourne quand même le succès
        // car l'organisation est créée, l'utilisateur pourra se reconnecter
      } else if (!finalProfile || finalProfile.organization_id !== newOrg.id) {
        console.error("Profil non mis à jour:", finalProfile);
        // Essayer une dernière fois avec upsert
        await adminClient
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email ?? "",
            organization_id: newOrg.id,
            role: "admin",
          }, {
            onConflict: "id",
          });
      }

      // Revalider tous les chemins
      revalidatePath("/settings", "page");
      revalidatePath("/dashboard", "page");
      revalidatePath("/", "layout");
      revalidatePath("/users", "page");

      return {
        status: "success",
        message: `Organisation créée avec succès. Code d'organisation : ${newOrg.code}. La page va se recharger...`,
      };
    }
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour de l'organisation:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? `Erreur : ${error.message}`
          : "Impossible d'enregistrer l'organisation. Veuillez réessayer.",
    };
  }
}
