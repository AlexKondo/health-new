"use client";

import { useEffect, useRef, useState } from "react";

const GRADES = [
  "Berçário", "Grupo 1", "Grupo 2", "Grupo 3", "Grupo 4", "Grupo 5",
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
];
const PERIODS = ["Manhã", "Tarde", "Integral"];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function maxISO() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ at: string; label: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const submittingRef = useRef(false);

  function loadSlots(d: string) {
    if (!d) { setSlots([]); return; }
    setSlotsLoading(true);
    fetch(`/api/visit-slots?date=${d}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }

  useEffect(() => {
    setScheduledAt("");
    loadSlots(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("sending");
    setErrorMsg("");
    // currentTarget vira null depois de um await (fim da fase de propagação
    // do evento) — captura a referência do form antes do fetch.
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setErrorMsg(d.error || "Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.");
          setScheduledAt("");
          loadSlots(date);
        } else {
          setErrorMsg(d.error || "");
        }
        throw new Error();
      }
      setStatus("ok");
      form.reset();
      setDate("");
      setSlots([]);
      setScheduledAt("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl bg-brand-soft p-8 text-center">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 text-xl font-bold text-brand-dark">Recebemos seu contato!</h3>
        <p className="mt-1 text-sm text-foreground/70">Em breve entraremos em contato para agendar sua visita.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field name="name" label="Nome*" required className="sm:col-span-2" />
      <Field name="email" label="E-mail" type="email" />
      <Field name="phone" label="Telefone / WhatsApp" />
      <Select name="child_grade" label="Série de interesse" options={GRADES} />
      <Select name="period" label="Período" options={PERIODS} />

      <label className="text-sm font-semibold">
        Data desejada para a visita
        <input
          type="date"
          min={todayISO()}
          max={maxISO()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
      </label>
      <div className="text-sm font-semibold">
        Horário
        {!date && <p className="mt-1 text-xs font-normal text-foreground/50">Escolha uma data primeiro.</p>}
        {date && slotsLoading && <p className="mt-1 text-xs font-normal text-foreground/50">Carregando horários…</p>}
        {date && !slotsLoading && slots.length === 0 && (
          <p className="mt-1 text-xs font-normal text-foreground/50">Sem horários livres nesse dia — escolha outra data ou envie sem horário que entramos em contato.</p>
        )}
        {date && !slotsLoading && slots.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s.at}
                type="button"
                onClick={() => setScheduledAt(s.at)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                  scheduledAt === s.at
                    ? "border-brand bg-brand text-white"
                    : "border-brand-soft bg-white text-brand-dark hover:border-brand"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <input type="hidden" name="scheduled_at" value={scheduledAt} />

      <label className="sm:col-span-2 text-sm font-semibold">
        Mensagem
        <textarea
          name="message"
          rows={3}
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
      </label>
      <div className="sm:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-accent px-6 py-3 font-bold text-white hover:brightness-95 disabled:opacity-60"
        >
          {status === "sending" ? "Enviando…" : "Quero agendar uma visita"}
        </button>
        {status === "error" && (
          <span className="text-sm text-red-600">{errorMsg || "Não foi possível enviar. Tente novamente."}</span>
        )}
      </div>
    </form>
  );
}

function Field({
  name, label, type = "text", required = false, className = "",
}: { name: string; label: string; type?: string; required?: boolean; className?: string }) {
  return (
    <label className={`text-sm font-semibold ${className}`}>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
      />
    </label>
  );
}

function Select({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        name={name}
        className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand bg-white"
      >
        <option value="">Selecione…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
