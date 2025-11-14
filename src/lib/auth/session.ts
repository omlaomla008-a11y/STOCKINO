import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const getUser = async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

export const requireUser = async (): Promise<User> => {
  const user = await getUser();
  if (!user) {
    redirect("/signin");
  }

  return user;
};

export const redirectIfAuthenticated = async (path = "/dashboard") => {
  const user = await getUser();
  if (user) {
    redirect(path);
  }
};


