"use client";

import { useActionState } from "react";

import { studioLoginAction, type StudioLoginState } from "@/lib/hub/studio-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: StudioLoginState = { status: "idle" };

export function StudioLoginForm() {
  const [state, formAction, pending] = useActionState(studioLoginAction, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Studio Tech Hub</CardTitle>
        <CardDescription>
          Accès réservé pour gérer le matériel et les articles du blog — sans compte Stockino.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Connexion…" : "Accéder au studio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
