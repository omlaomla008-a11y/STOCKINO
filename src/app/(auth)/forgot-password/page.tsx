"use client";

import { useState, useTransition, type FormEvent } from "react";
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
  const [state, setState] = useState<AuthFormState>(authDefaultState);
  const [isPending, startTransition] = useTransition();

  const isSuccess = state.status === "success";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await resetPasswordAction(authDefaultState, formData);
      setState(result);
      if (result.status === "success") {
        form.reset();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("pending", "…")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </form>
        {state.message ? (
          <p
            className={`mt-4 text-sm ${
              isSuccess ? "text-green-600 dark:text-green-500" : "text-destructive"
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
