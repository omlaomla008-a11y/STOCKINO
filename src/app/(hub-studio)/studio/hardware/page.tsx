import Link from "next/link";
import { Plus } from "lucide-react";

import { HardwareListClient } from "@/components/hub-admin/hardware-list-client";
import { requireHubStudio } from "@/lib/hub/studio-auth";
import { getAllHardwareForAdmin } from "@/lib/hub/queries";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default async function StudioHardwarePage() {
  await requireHubStudio();
  const products = await getAllHardwareForAdmin();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Matériel</h1>
          <p className="text-sm text-muted-foreground">{products.length} produit(s)</p>
        </div>
        <Button asChild>
          <Link href="/studio/hardware/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>
      <HardwareListClient products={products} />
    </div>
  );
}

