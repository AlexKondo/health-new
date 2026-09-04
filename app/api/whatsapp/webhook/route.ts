import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { buildKnowledgeBase } from "@/lib/knowledge";
import { runAgent, type AgentTurn } from "@/lib/agent";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";

/** Verificação do webhook (Meta). */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/** Recebimento de mensagens. */
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = extractTextMessage(payload);
  // Sempre responder 200 rápido para a Meta não reenviar.
  if (!msg) return NextResponse.json({ ok: true });

  // Processa de forma assíncrona (não bloqueia o ACK).
  handleMessage(msg.from, msg.text, msg.name).catch((e) =>
    console.error("Erro ao processar WhatsApp:", e),
  );

  return NextResponse.json({ ok: true });
}

type Incoming = { from: string; text: string; name?: string };

function extractTextMessage(payload: unknown): Incoming | null {
  try {
    const entry = (payload as any)?.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message || message.type !== "text") return null;
    return {
      from: message.from,
      text: message.text?.body ?? "",
      name: value?.contacts?.[0]?.profile?.name,
    };
  } catch {
    return null;
  }
}

async function handleMessage(from: string, text: string, name?: string) {
  const sb = createServiceClient();

  // upsert contato
  await sb.from("wa_contacts").upsert(
    { phone: from, name: name ?? null, updated_at: new Date().toISOString() },
    { onConflict: "phone" },
  );

  // grava mensagem recebida
  await sb.from("wa_messages").insert({ phone: from, direction: "in", content: text });

  // transbordo humano: se bot pausado, não responde
  const { data: contact } = await sb
    .from("wa_contacts")
    .select("bot_paused")
    .eq("phone", from)
    .single();
  if (contact?.bot_paused) return;

  // histórico recente (contexto)
  const { data: rows } = await sb
    .from("wa_messages")
    .select("direction, content")
    .eq("phone", from)
    .order("created_at", { ascending: false })
    .limit(12);

  const history: AgentTurn[] = (rows ?? [])
    .reverse()
    .map((r) => ({ role: r.direction === "in" ? "user" : "assistant", content: r.content }));

  const knowledge = await buildKnowledgeBase();
  const reply = await runAgent(knowledge, history);
  if (!reply) return;

  await sb.from("wa_messages").insert({ phone: from, direction: "out", content: reply });
  await sendWhatsAppText(from, reply);
}
