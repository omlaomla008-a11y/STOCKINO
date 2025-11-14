"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Shield, User } from "lucide-react";

import { USER_ROLES } from "@/lib/constants";
import { updateUserRoleAction, inviteUserAction } from "@/lib/users/actions";
import { useTranslations } from "@/components/i18n/translations-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

type UsersClientProps = {
  initialUsers: User[];
  currentUserId: string;
  canManage: boolean;
  currentUserRole: string | null;
};

export function UsersClient({
  initialUsers,
  currentUserId,
  canManage,
  currentUserRole,
}: UsersClientProps) {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ status: "success" | "error"; message: string } | null>(
    null,
  );

  const handleRoleChange = (userId: string, newRole: (typeof USER_ROLES)[number]) => {
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, newRole);
      setFeedback(result);
      if (result.status === "success") {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        );
        setTimeout(() => {
          router.refresh();
        }, 500);
      }
    });
  };

  const translateRole = (role: string) => {
    try {
      return t(`roles.${role}` as any);
    } catch {
      return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            feedback.status === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          {canManage && <InviteUserDialog onSuccess={() => router.refresh()} />}
        </CardHeader>
        <CardContent className="px-0">
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                {t("noUsers")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.email")}</TableHead>
                  <TableHead>{t("table.role")}</TableHead>
                  <TableHead>{tCommon("date")}</TableHead>
                  {canManage && <TableHead className="text-right">{t("table.actions")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  const displayName = user.full_name || user.email.split("@")[0] || "Utilisateur";

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{displayName}</div>
                            {isCurrentUser && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {t("table.you")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canManage && !isCurrentUser ? (
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              handleRoleChange(user.id, value as (typeof USER_ROLES)[number])
                            }
                            disabled={pending}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {USER_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {translateRole(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            <Shield className="mr-1 h-3 w-3" />
                            {translateRole(user.role)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          {isCurrentUser ? (
                            <span className="text-xs text-muted-foreground">
                              {t("table.you")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {t("table.actions")}
                            </span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InviteUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations("users.dialog.add");
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<
    { status: "success" | "error"; message: string } | null,
    FormData
  >(inviteUserAction, null);

  // Fermer le dialog et rafraîchir après succès
  useEffect(() => {
    if (state?.status === "success" && open) {
      const timer = setTimeout(() => {
        setOpen(false);
        onSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.status, open, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="utilisateur@exemple.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input id="fullName" name="fullName" placeholder="Jean Dupont" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t("role")}</Label>
            <Select name="role" defaultValue="operator" required>
              <SelectTrigger>
                <SelectValue placeholder={t("selectRole")} />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {tUsers(`roles.${role}` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("passwordHint")}
            />
            <p className="text-xs text-muted-foreground">
              {t("passwordHint")}
            </p>
          </div>
          {state && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                state.status === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {state.message}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const t = useTranslations("users.dialog.add");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("pending")}
        </>
      ) : (
        t("submit")
      )}
    </Button>
  );
}

