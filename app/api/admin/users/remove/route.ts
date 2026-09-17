import { NextResponse } from "next/server";
import { requireUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Rota dedicada (fora de /admin, sem passar pelo middleware) pra remover um
 * usuário do painel. A lista já remove a linha da tela de forma otimista
 * antes dessa chamada terminar — aqui só precisa confirmar no Supabase e
 * devolver ok/erro, sem revalidar/re-buscar a lista inteira no caminho.
 */
export async function POST(request: Request) {
  const auth = await requireUserJson();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const { id } = await request.json().catch(() => ({ id: null }));
  if (!id || typeof id !== "string") {
    return NextResponse.json({ ok: false, error: "Usuário inválido." }, { status: 400 });
  }
  if (id === user.id) {
    return NextResponse.json({ ok: false, error: "Você não pode remover o próprio acesso." }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

async function requireUserJson() {
  try {
    const { user } = await requireUser();
    return { ok: true as const, user };
  } catch {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 }) };
  }
}
