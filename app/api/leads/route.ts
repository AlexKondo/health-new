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

  let scheduled_at: string | null = null;
  if (body.scheduled_at) {
    const d = new Date(String(body.scheduled_at));
    if (isNaN(d.getTime())) return NextResponse.json({ error: "Horário inválido" }, { status: 400 });
    scheduled_at = d.toISOString();
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .rpc("book_lead", {
      p_name: name,
      p_email: str(body.email),
      p_phone: str(body.phone),
      p_child_grade: str(body.child_grade),
      p_period: str(body.period),
      p_message: str(body.message),
      p_scheduled_at: scheduled_at,
    })
    .single<{ id: string | null; error: string | null }>();

  if (error) {
    console.error("Erro ao salvar lead:", error);
    return NextResponse.json({ error: "Não foi possível enviar agora" }, { status: 500 });
  }
  if (data?.error) {
    return NextResponse.json({ error: data.error }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

const str = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s || null;
};
