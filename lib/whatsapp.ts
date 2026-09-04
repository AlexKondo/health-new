/** WhatsApp Cloud API (Meta) — envio de mensagens de texto. */
const GRAPH = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneId || !token) {
    console.error("WhatsApp não configurado (WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_TOKEN).");
    return;
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: body.slice(0, 4096) },
    }),
  });
  if (!res.ok) {
    console.error("Falha ao enviar WhatsApp:", res.status, await res.text());
  }
}
