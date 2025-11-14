"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { USER_ROLES } from "@/lib/constants";
import { updateUserRoleAction } from "@/lib/users/actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  isCurrent?: boolean;
};

type Feedback = {
  status: "success" | "error";
  message: string;
};

type TeamMembersCardProps = {
  members: Member[];
  canManage: boolean;
  organizationCode?: string | null;
  organizationName?: string | null;
};

export function TeamMembersCard({
  members,
  canManage,
  organizationCode,
  organizationName,
}: TeamMembersCardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!pending && feedback?.status === "success") {
      setTimeout(() => {
        router.refresh();
      }, 300);
    }
  }, [pending, feedback?.status, router]);

  const handleRoleChange = (memberId: string, nextRole: (typeof USER_ROLES)[number]) => {
    startTransition(async () => {
      const result = await updateUserRoleAction(memberId, nextRole);
      setFeedback(result);
      if (result.status === "success") {
        router.refresh();
      }
    });
  };

  const sortedMembers = [...members].sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email);
  });

  const hasOrganization = Boolean(organizationCode);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Équipe</CardTitle>
          <CardDescription>
            Gérez les membres de votre organisation et définissez leurs rôles.
          </CardDescription>
        </div>
        {canManage && hasOrganization ? (
          <InviteMemberDialog organizationCode={organizationCode ?? ""} onFeedback={setFeedback} />
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback ? (
          <p
            className={cn(
              "text-sm",
              feedback.status === "success" ? "text-green-600" : "text-destructive",
            )}
          >
            {feedback.message}
          </p>
        ) : null}
        {!hasOrganization ? (
          <p className="text-sm text-muted-foreground">
            Créez d'abord votre organisation pour inviter des collaborateurs.
          </p>
        ) : sortedMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun membre pour l'instant. Ajoutez vos collaborateurs pour collaborer sur STOCKINO.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {member.full_name ?? member.email}
                        {member.isCurrent ? (
                          <Badge variant="secondary" className="ml-2">
                            Vous
                          </Badge>
                        ) : null}
                      </span>
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <RoleSelector
                        currentRole={member.role}
                        disabled={pending || member.isCurrent}
                        onChange={(role) => handleRoleChange(member.id, role)}
                      />
                    ) : (
                      <Badge variant="outline" className="font-normal capitalize">
                        {translateRole(member.role)}
                      </Badge>
                    )}
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {member.isCurrent
                        ? "Administrateur principal"
                        : "Changer le rôle pour ajuster les permissions"}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {hasOrganization && organizationCode ? (
        <CardFooter className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Code d'organisation :</span>
            <span className="font-mono font-bold text-foreground">{organizationCode}</span>
          </div>
          <span>
            Partagez ce code avec vos collaborateurs : ils devront l'indiquer lors de leur connexion.
          </span>
          {organizationName ? (
            <span>
              Organisation : <span className="font-medium text-foreground">{organizationName}</span>
            </span>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}

function RoleSelector({
  currentRole,
  disabled,
  onChange,
}: {
  currentRole: string;
  disabled?: boolean;
  onChange: (role: (typeof USER_ROLES)[number]) => void;
}) {
  return (
    <Select
      defaultValue={currentRole}
      onValueChange={(value) => onChange(value as (typeof USER_ROLES)[number])}
      disabled={disabled}
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
