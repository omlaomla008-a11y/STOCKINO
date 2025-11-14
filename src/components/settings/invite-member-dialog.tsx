"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { USER_ROLES } from "@/lib/constants";
import { inviteUserAction } from "@/lib/users/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InviteState =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    }
  | {
      status: null;
      message: "";
    };

const initialState: InviteState = {
  status: null,
  message: "",
};

type InviteMemberDialogProps = {
  organizationCode: string;
  onFeedback?: (feedback: { status: "success" | "error"; message: string } | null) => void;
};

export function InviteMemberDialog({ organizationCode, onFeedback }: InviteMemberDialogProps) {
  const [state, formAction, pending] = useActionState(inviteUserAction, initialState);
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<(typeof USER_ROLES)[number]>("operator");

  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => {
        setOpen(false);
        setSelectedRole("operator");
        onFeedback?.(state);
      }, 500);
      return () => clearTimeout(timer);
    } else if (state.status === "error") {
      onFeedback?.(state);
    }
  }, [state, onFeedback]);

  useEffect(() => {
    if (!open) {
      setSelectedRole("operator");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
          <DialogDescription>
            Créez un compte pour un collaborateur avec un email et un mot de passe.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="role" value={selectedRole} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" name="fullName" placeholder="Ex. Sofia Karim" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de connexion *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="utilisateur@exemple.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 caractères"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as (typeof USER_ROLES)[number])}
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {translateRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {state.status === "error" ? (
              <p className="flex-1 text-sm text-destructive">{state.message}</p>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'utilisateur"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function translateRole(role: string) {
  switch (role) {
    case "admin":
      return "Administrateur";
    case "manager":
      return "Manager";
    default:
      return "Opérateur";
  }
}
