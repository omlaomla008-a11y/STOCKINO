import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { HardwareForm } from "@/components/hub-admin/hardware-form";
import { requireHubAdmin } from "@/lib/hub/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewHubHardwarePage() {
  await requireHubAdmin();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/hub/hardware">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Nouveau produit matériel</h1>
      <HardwareForm />
    </div>
  );
}
