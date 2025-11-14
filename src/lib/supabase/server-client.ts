import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

import type { Database } from "@/types/database.types";

import { getSupabaseEnv } from "./env";

export const createSupabaseServerClient = async (): Promise<SupabaseClient<Database>> => {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  const headerStore = await headers();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // ignore; not allowed outside server actions
        }
      },
      remove(name, options) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {
          // ignore
        }
      },
    },
    headers: new Headers(headerStore),
  });
};
