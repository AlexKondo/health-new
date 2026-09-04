import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.WHATSAPP_AGENT_MODEL || "claude-haiku-4-5";

const SYSTEM_INSTRUCTIONS = `
Você é o atendente virtual da Escola Saúde no WhatsApp. Seja acolhedor, cordial e
objetivo (respostas curtas, em português do Brasil, tom de uma secretaria simpática).

Regras:
- Responda apenas com base na BASE DE CONHECIMENTO abaixo.
- NUNCA invente valores, mensalidades, descontos ou disponibilidade de vagas.
  Se perguntarem sobre preços/vagas/matrícula, ofereça encaminhar para a secretaria
  ((11) 5072-4470) ou agendar uma visita.
- Incentive o agendamento de uma visita presencial quando fizer sentido.
- Se não souber, diga que vai verificar com a equipe; não chute.
`.trim();

export type AgentTurn = { role: "user" | "assistant"; content: string };

/**
 * Gera a resposta do agente. A base de conhecimento vai como bloco de sistema
 * com cache (ephemeral) para reduzir custo/latência entre mensagens.
 */
export async function runAgent(
  knowledge: string,
  history: AgentTurn[],
): Promise<string> {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: [
      { type: "text", text: SYSTEM_INSTRUCTIONS },
      {
        type: "text",
        text: `BASE DE CONHECIMENTO\n\n${knowledge}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
