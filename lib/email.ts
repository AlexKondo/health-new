import { createServiceClient } from "@/lib/supabase/service";

const SENDER = { name: "Escola Saúde - Site", email: "marketing@escolasaude.com.br" };

// Plano free da Brevo permite 300 e-mails/dia — acima disso ela cobra por
// envio. Paramos de enviar antes de bater nesse limite (o admin vê avisos
// no painel a partir de 200/250).
export const DAILY_EMAIL_LIMIT = 300;

function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function reserveEmailSlot(): Promise<boolean> {
  const service = createServiceClient();
  const { data, error } = await service
    .rpc("record_email_send", { p_max: DAILY_EMAIL_LIMIT })
    .single<{ allowed: boolean; sent_count: number }>();
  if (error) {
    console.error("Falha ao checar cota de e-mail:", error.message);
    return true; // não bloqueia o envio por falha no contador em si, só loga
  }
  if (!data.allowed) {
    console.error(`Cota diária de e-mail atingida (${data.sent_count}/${DAILY_EMAIL_LIMIT}) — envio bloqueado até amanhã.`);
  }
  return data.allowed;
}

async function sendBrevoEmail(opts: { to: string; subject: string; html: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY não configurada — e-mail não enviado.");
    return;
  }
  if (!(await reserveEmailSlot())) return;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: opts.to }],
      subject: opts.subject,
      htmlContent: opts.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Falha ao enviar e-mail via Brevo:", res.status, body);
  }
}

type LeadNotification = {
  name: string;
  email: string | null;
  phone: string | null;
  child_grade: string | null;
  period: string | null;
  message: string | null;
  scheduled_at: string | null;
};

/** Notifica a secretaria por e-mail quando um novo agendamento chega pelo site. */
export async function notifyNewLead(lead: LeadNotification) {
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!to) {
    console.error("LEADS_NOTIFY_EMAIL não configurado — notificação de lead não enviada.");
    return;
  }

  const scheduledLabel = lead.scheduled_at
    ? new Date(lead.scheduled_at).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "full",
        timeStyle: "short",
      })
    : null;

  const rows: [string, string | null][] = [
    ["Nome", lead.name],
    ["E-mail", lead.email],
    ["Telefone", lead.phone],
    ["Série de interesse", lead.child_grade],
    ["Período", lead.period],
    ["Visita desejada", scheduledLabel],
    ["Mensagem", lead.message],
  ];

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#155186;">Novo agendamento de visita</h2>
      <table role="presentation" cellpadding="6" cellspacing="0" style="width:100%;">
        ${rows
          .filter(([, v]) => v)
          .map(
            ([label, v]) =>
              `<tr><td style="font-weight:bold;color:#155186;vertical-align:top;">${escapeHtml(label)}</td><td>${escapeHtml(String(v))}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top:16px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads" style="color:#1f6fb2;">Ver no painel</a></p>
    </div>
  `;

  await sendBrevoEmail({
    to,
    subject: `Novo agendamento: ${lead.name}`,
    html,
  });
}
