import type { ReactNode } from "react";

import { PublicFooter } from "@/components/hub/public-footer";
import { PublicHeader } from "@/components/hub/public-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
