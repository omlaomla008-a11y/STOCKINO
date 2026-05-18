import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

const COOKIE_NAME = "hub_studio_session";
const SESSION_VERSION = "v1";

function getStudioSecret(): string {
  const secret = process.env.HUB_STUDIO_SECRET ?? process.env.HUB_STUDIO_PASSWORD;
  if (!secret || secret.length < 8) {
    throw new Error(
      "HUB_STUDIO_PASSWORD manquant ou trop court (min. 8 caractères). Définissez-le dans .env.local et sur Netlify.",
    );
  }
  return secret;
}

export function getStudioSessionToken(): string {
  return createHmac("sha256", getStudioSecret())
    .update(`hub-studio-session-${SESSION_VERSION}`)
    .digest("hex");
}

export async function isHubStudioAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME)?.value;
    if (!session) return false;

    const expected = getStudioSessionToken();
    if (session.length !== expected.length) return false;

    return timingSafeEqual(Buffer.from(session), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function requireHubStudio() {
  const authenticated = await isHubStudioAuthenticated();
  if (!authenticated) {
    redirect("/studio/login");
  }
  return { adminClient: getSupabaseAdminClient() };
}

export function verifyStudioPassword(password: string): boolean {
  const expected = process.env.HUB_STUDIO_PASSWORD;
  if (!expected) return false;
  if (password.length !== expected.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
