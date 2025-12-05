"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

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
import { adminResetPasswordAction } from "@/lib/auth/actions";
import {
  authDefaultState,
  type AuthFormState,
} from "@/lib/auth/form-state";

export default function AdminResetPasswordPage() {
  const [state, formAction] = useActionState<
    AuthFormState & { resetLink?: string },
    FormData
  >(adminResetPasswordAction, authDefaultState);

  const isSuccess = state.status === "success";
  const resetLink = (state as any).resetLink;

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Réinitialiser le mot de passe (Admin)
          </CardTitle>
          <CardDescription>
            Générez un lien de réinitialisation de mot de passe pour un utilisateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de l'utilisateur</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="utilisateur@exemple.com"
              />
            </div>
            <SubmitButton />
          </form>

          {state.message ? (
            <div
              className={`mt-4 rounded-lg border p-4 ${
                isSuccess
                  ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                  : "border-destructive/50 bg-destructive/10"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isSuccess ? "text-green-800 dark:text-green-200" : "text-destructive"
                }`}
              >
                {state.message}
              </p>
              {resetLink && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Lien de réinitialisation:
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={resetLink}
                      className="font-mono text-xs"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(resetLink);
                        alert("Lien copié dans le presse-papiers!");
                      }}
                    >
                      Copier
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envoyez ce lien à l'utilisateur par email ou autre moyen sécurisé.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération en cours...
        </>
      ) : (
        "Générer le lien de réinitialisation"
      )}
    </Button>
  );
}

