import { NextResponse } from "next/server";
import { after } from "next/server";
import { requireUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Rota dedicada (fora de /admin, sem passar pelo middleware) pra enviar ou
 * reenviar um convite. Usada tanto pela tela de "Convidar usuário" quanto
 * pelo botão "Reenviar convite" — mesma chamada, resultado idêntico.
 */
export async function POST(request: Request) {
  const auth = await requireUserJson();
  if (!auth.ok) return auth.response;

  const { email: rawEmail } = await request.json().catch(() => ({ email: null }));
  const email = String(rawEmail || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "E-mail inválido." }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/redefinir-senha`,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const sentAt = new Date().toISOString();
  // Grava o histórico depois de já ter respondido — não deixa o convite
  // mais lento por causa de uma escrita que é só pra exibição depois.
  after(async () => {
    await service.from("invite_sends").insert({ email, sent_at: sentAt });
  });

  return NextResponse.json({ ok: true, sentAt });
}

async function requireUserJson() {
  try {
    const { user } = await requireUser();
    return { ok: true as const, user };
  } catch {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 }) };
  }
}
