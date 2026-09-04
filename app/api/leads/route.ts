import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

/** Recebe o formulário de agendamento de visita e grava em `leads`. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { error } = await sb.from("leads").insert({
    name,
    email: str(body.email),
    phone: str(body.phone),
    child_grade: str(body.child_grade),
    period: str(body.period),
    message: str(body.message),
  });

  if (error) {
    console.error("Erro ao salvar lead:", error);
    return NextResponse.json({ error: "Não foi possível enviar agora" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

const str = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s || null;
};
