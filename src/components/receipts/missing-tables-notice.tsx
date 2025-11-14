"use client";

import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MissingTablesNotice() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Tables de base de données manquantes</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Les tables nécessaires pour les bons d'entrée/sortie n'ont pas encore été créées dans Supabase.
        </p>
        <p className="mb-2 font-semibold">Pour activer ce module :</p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Ouvrez votre projet Supabase</li>
          <li>Allez dans <strong>SQL Editor</strong></li>
          <li>Copiez le contenu du fichier <code className="bg-muted px-1 rounded">supabase/migrations/create_receipts_tables.sql</code></li>
          <li>Collez-le dans l'éditeur SQL et exécutez-le</li>
        </ol>
        <p className="mt-2 text-xs">
          Une fois les tables créées, rafraîchissez cette page.
        </p>
      </AlertDescription>
    </Alert>
  );
}

