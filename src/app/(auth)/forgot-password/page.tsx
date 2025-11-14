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
import { resetPasswordAction } from "@/lib/auth/actions";
import {
  authDefaultState,
  type AuthFormState,
} from "@/lib/auth/form-state";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    resetPasswordAction,
    authDefaultState,
  );

  const isSuccess = state.status === "success";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="vous@exemple.com"
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
            {isSuccess ? t("success") : state.message}
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            <span>{t("hint")}</span>{" "}
            <Link href="/signin" className="text-primary hover:underline">
              {t("back")}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth.forgot");

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
