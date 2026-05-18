import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { HardwareForm } from "@/components/hub-admin/hardware-form";
import { requireHubAdmin } from "@/lib/hub/auth";
import { getHardwareByIdForAdmin } from "@/lib/hub/queries";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditHubHardwarePage({ params }: PageProps) {
  await requireHubAdmin();
  const { id } = await params;
  const product = await getHardwareByIdForAdmin(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/hub/hardware">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Modifier : {product.name}</h1>
      <HardwareForm product={product} />
    </div>
  );
}
