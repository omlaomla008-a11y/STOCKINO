import type { ReactNode } from "react";

import { StudioHeader } from "@/components/hub-studio/studio-header";
import { isHubStudioAuthenticated } from "@/lib/hub/studio-auth";

export default async function HubStudioLayout({ children }: { children: ReactNode }) {
  const authenticated = await isHubStudioAuthenticated();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {authenticated ? <StudioHeader /> : null}
      <main className="flex-1">{children}</main>
    </div>
  );
}

