import { requireUser } from "@/lib/admin";
import { DAILY_EMAIL_LIMIT } from "@/lib/email";

function todayInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export default async function EmailQuotaBanner() {
  const { sb } = await requireUser();
  const { data } = await sb
    .from("email_quota")
    .select("sent_count")
    .eq("day", todayInSaoPaulo())
    .maybeSingle();

  const sent = data?.sent_count ?? 0;
  if (sent < 200) return null;

  if (sent >= DAILY_EMAIL_LIMIT) {
    return (
      <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
        Limite diário de {DAILY_EMAIL_LIMIT} e-mails atingido ({sent}/{DAILY_EMAIL_LIMIT}) — notificações de novo
        agendamento estão pausadas até amanhã, pra evitar cobrança extra da Brevo.
      </div>
    );
  }

  const strong = sent >= 250;
  return (
    <div
      className={`mb-6 rounded-2xl p-4 text-sm font-semibold ring-1 ${
        strong ? "bg-orange-50 text-orange-700 ring-orange-200" : "bg-amber-50 text-amber-700 ring-amber-200"
      }`}
    >
      Aviso: {sent}/{DAILY_EMAIL_LIMIT} e-mails enviados hoje. Ao chegar em {DAILY_EMAIL_LIMIT}, as notificações
      param automaticamente até o próximo dia.
    </div>
  );
}
