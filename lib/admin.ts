import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Garante que há um usuário autenticado; senão redireciona ao login. */
export async function requireUser() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  return { user, sb };
}
