"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { useTranslations } from "@/components/i18n/translations-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  authDefaultState,
  type AuthFormState,
} from "@/lib/auth/form-state";

async function updatePasswordAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 6) {
    return {
      message: "Le mot de passe doit contenir au moins 6 caractères.",
      status: "error",
    };
  }

  if (password !== confirmPassword) {
    return {
      message: "Les mots de passe ne correspondent pas.",
      status: "error",
    };
  }

  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return {
      message: error.message || "Impossible de mettre à jour le mot de passe.",
      status: "error",
    };
  }

  return {
    message: "Mot de passe mis à jour avec succès. Vous pouvez maintenant vous connecter.",
    status: "success",
  };
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth.reset");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    updatePasswordAction,
    authDefaultState,
  );

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    async function validateToken() {
      const supabase = createSupabaseBrowserClient();
      
      // Supabase gère automatiquement les tokens de réinitialisation via le hash dans l'URL
      // On vérifie simplement si une session existe après le traitement du hash
      const { data: { session }, error } = await supabase.auth.getSession();

      // Si pas de session, vérifier s'il y a un hash dans l'URL (token de réinitialisation)
      if (!session) {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Le hash contient un token, Supabase va le traiter automatiquement
          // Attendre un peu pour que Supabase traite le hash
          setTimeout(async () => {
            const { data: { session: newSession } } = await supabase.auth.getSession();
            setIsValidating(false);
            setIsValid(!!newSession);
          }, 500);
          return;
        }
        setIsValidating(false);
        setIsValid(false);
        return;
      }

      setIsValidating(false);
      setIsValid(true);
    }

    validateToken();
  }, [searchParams]);

  const isSuccess = state.status === "success";

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{t("successTitle")}</CardTitle>
          <CardDescription>{t("successDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-green-600">{state.message}</p>
          <Button onClick={() => router.push("/signin")} className="w-full">
            {t("goToSignIn")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isValidating) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isValid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{t("invalidTitle")}</CardTitle>
          <CardDescription>{t("invalidDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-destructive">
            Le lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link href="/forgot-password" className="text-primary hover:underline">
            {t("requestNewLink")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("newPassword")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder={t("passwordPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder={t("confirmPasswordPlaceholder")}
            />
          </div>
          <SubmitButton />
        </form>
        {state.message ? (
          <p
            className={`mt-4 text-sm ${
              isSuccess ? "text-green-600" : "text-destructive"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth.reset");

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("updating")}
        </>
      ) : (
        t("submit")
      )}
    </Button>
  );
}

