"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminResetPasswordAction, adminSetPasswordAction } from "@/lib/auth/actions";
import {
  authDefaultState,
  type AuthFormState,
} from "@/lib/auth/form-state";

export function AdminResetPasswordClient() {
  const [method, setMethod] = useState<"link" | "direct">("direct");
  
  const [linkState, linkFormAction] = useActionState<
    AuthFormState & { resetLink?: string },
    FormData
  >(adminResetPasswordAction, authDefaultState);

  const [passwordState, passwordFormAction] = useActionState<AuthFormState, FormData>(
    adminSetPasswordAction,
    authDefaultState,
  );

  const isLinkSuccess = linkState.status === "success";
  const isPasswordSuccess = passwordState.status === "success";
  const resetLink = (linkState as any).resetLink;

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Gestion des mots de passe (Admin)
          </CardTitle>
          <CardDescription>
            Réinitialisez ou définissez un nouveau mot de passe pour n'importe quel utilisateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={method} onValueChange={(v) => setMethod(v as "link" | "direct")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct">Définir directement</TabsTrigger>
              <TabsTrigger value="link">Générer un lien</TabsTrigger>
            </TabsList>

            <TabsContent value="direct" className="space-y-4">
              <form action={passwordFormAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-direct">Email de l'utilisateur</Label>
                  <Input
                    id="email-direct"
                    name="email"
                    type="email"
                    required
                    placeholder="utilisateur@exemple.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Au moins 6 caractères"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le mot de passe sera défini immédiatement. L'utilisateur pourra se connecter avec ce nouveau mot de passe.
                  </p>
                </div>
                <SetPasswordButton />
              </form>
              {passwordState.message ? (
                <div
                  className={`mt-4 rounded-lg border p-4 ${
                    isPasswordSuccess
                      ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                      : "border-destructive/50 bg-destructive/10"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      isPasswordSuccess ? "text-green-800 dark:text-green-200" : "text-destructive"
                    }`}
                  >
                    {passwordState.message}
                  </p>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="link" className="space-y-4">
              <form action={linkFormAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-link">Email de l'utilisateur</Label>
                  <Input
                    id="email-link"
                    name="email"
                    type="email"
                    required
                    placeholder="utilisateur@exemple.com"
                  />
                </div>
                <GenerateLinkButton />
              </form>

              {linkState.message ? (
                <div
                  className={`mt-4 rounded-lg border p-4 ${
                    isLinkSuccess
                      ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                      : "border-destructive/50 bg-destructive/10"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      isLinkSuccess ? "text-green-800 dark:text-green-200" : "text-destructive"
                    }`}
                  >
                    {linkState.message}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SetPasswordButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Définition en cours...
        </>
      ) : (
        "Définir le nouveau mot de passe"
      )}
    </Button>
  );
}

function GenerateLinkButton() {
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

