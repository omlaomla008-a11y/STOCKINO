"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  COOKIE_NAME,
  getStudioSessionToken,
  verifyStudioPassword,
} from "@/lib/hub/studio-auth";

export type StudioLoginState = {
  status: "idle" | "error";
  message?: string;
};

export async function studioLoginAction(
  _prev: StudioLoginState,
  formData: FormData,
): Promise<StudioLoginState> {
  const password = (formData.get("password") as string) ?? "";

  if (!process.env.HUB_STUDIO_PASSWORD) {
    return {
      status: "error",
      message: "Mot de passe studio non configuré sur le serveur (HUB_STUDIO_PASSWORD).",
    };
  }

  if (!verifyStudioPassword(password)) {
    return { status: "error", message: "Mot de passe incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, getStudioSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  redirect("/studio");
}

export async function studioLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/studio/login");
}
