"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
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
import { signUpAction } from "@/lib/auth/actions";
import {
  authDefaultState,
  type AuthFormState,
} from "@/lib/auth/form-state";

export default function SignUpPage() {
  const t = useTranslations("auth.signup");
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    signUpAction,
    authDefaultState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">{t("company")}</Label>
            <Input
              id="company"
              name="company"
              placeholder="Nom de votre boutique"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state.message ? (
            <p
              className={`text-sm ${
                state.status === "success"
                  ? "text-green-600"
                  : "text-destructive"
              }`}
            >
              {state.status === "error" ? state.message : state.message}
            </p>
          ) : null}
          <SubmitButton />
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          {t("existing")}{" "}
          <Link href="/signin" className="text-primary hover:underline">
            {t("existingLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth.signup");

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("pending", "…")}
        </>
      ) : (
        t("submit")
      )}
    </Button>
  );
}
