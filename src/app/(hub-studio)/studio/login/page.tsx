import { redirect } from "next/navigation";

import { StudioLoginForm } from "@/components/hub-studio/studio-login-form";
import { isHubStudioAuthenticated } from "@/lib/hub/studio-auth";

export const metadata = {
  title: "Connexion Studio | STOCKINO",
  robots: { index: false, follow: false },
};

export default async function StudioLoginPage() {
  if (await isHubStudioAuthenticated()) {
    redirect("/studio");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <StudioLoginForm />
    </div>
  );
}

