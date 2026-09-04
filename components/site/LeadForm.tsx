"use client";

import { useState } from "react";

const GRADES = [
  "Berçário", "Grupo 1", "Grupo 2", "Grupo 3", "Grupo 4", "Grupo 5",
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
];
const PERIODS = ["Manhã", "Tarde", "Integral"];

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
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
          <span className="text-sm text-red-600">Não foi possível enviar. Tente novamente.</span>
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
