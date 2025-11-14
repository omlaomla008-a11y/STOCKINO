"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/i18n/translations-provider";
import { upsertOrganizationAction } from "@/lib/organization/actions";
import {
  organizationDefaultState,
  type OrganizationFormState,
} from "@/lib/organization/form-state";
import { useState } from "react";

type OrganizationFormProps = {
  defaultName: string;
  defaultContactEmail: string;
  role: string | null | undefined;
  code?: string | null;
};

export function OrganizationForm({
  defaultName,
  defaultContactEmail,
  role,
  code,
}: OrganizationFormProps) {
  const t = useTranslations("settings.organization");
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [state, formAction] = useActionState<OrganizationFormState, FormData>(
    upsertOrganizationAction,
    organizationDefaultState,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      // Forcer un rechargement complet de la page pour mettre à jour le layout
      // Utiliser un délai pour laisser le temps au serveur de finaliser
      const timer = setTimeout(() => {
        // Recharger avec cache bypass
        window.location.href = "/settings";
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          placeholder={t("namePlaceholder")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={defaultContactEmail}
          placeholder={t("contactEmailPlaceholder")}
        />
      </div>

      {state.message ? (
        <div
          className={`rounded-lg border p-3 text-sm ${
            state.status === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      {code ? (
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("code")}</p>
              <p className="mt-1 text-2xl font-bold tracking-wider font-mono">{code}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("codeHint")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <div>
          <span className="text-sm text-muted-foreground">{t("role")}: </span>
          <span className="text-sm font-medium">
            {tUsers(`roles.${role}` as any) || role}
          </span>
        </div>
        <SubmitButton />
      </div>

      {!defaultName && (
        <p className="text-xs text-muted-foreground">
          {t("createHint")}
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const t = useTranslations("settings.organization");
  const tCommon = useTranslations("common");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? tCommon("pending") : t("submit")}
    </Button>
  );
}
