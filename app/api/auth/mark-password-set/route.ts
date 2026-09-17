import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Marca app_metadata.password_set = true pro usuário logado, depois que
 * ele definiu uma senha de verdade (via updateUser). app_metadata só pode
 * ser alterado com a service-role key — por isso essa rota existe, em vez
 * de fazer isso direto no client.
 */
export async function POST() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const service = createServiceClient();
  const { error } = await service.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, password_set: true },
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
