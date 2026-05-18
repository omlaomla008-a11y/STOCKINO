"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { deleteHardwareAction } from "@/lib/hub/actions";
import type { HubHardwareRow } from "@/lib/hub/db-types";
import { getHardwareCategoryLabel } from "@/lib/content/hardware-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type HardwareListClientProps = {
  products: HubHardwareRow[];
  basePath?: string;
};

export function HardwareListClient({ products, basePath = "/studio" }: HardwareListClientProps) {
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer « ${name} » ?`)) return;
    const result = await deleteHardwareAction(id);
    if (result.status === "error") {
      alert(result.message);
      return;
    }
    router.refresh();
  };

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Aucun produit en base. Créez votre premier produit ou exécutez la migration SQL dans
        Supabase.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell>{getHardwareCategoryLabel(p.category)}</TableCell>
            <TableCell>
              {p.published ? (
                <Badge variant="secondary">Publié</Badge>
              ) : (
                <Badge variant="outline">Brouillon</Badge>
              )}
              {p.featured ? <Badge className="ml-1">Vedette</Badge> : null}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`${basePath}/hardware/${p.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(p.id, p.name)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
