"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackLink from "@/components/admin/BackLink";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);

    if (res?.ok && data?.ok) {
      router.push("/admin/usuarios");
      return;
    }
    setError(data?.error || "Não foi possível enviar o convite. Tente novamente.");
    setLoading(false);
  }

  return (
    <div className="max-w-lg">
      <BackLink href="/admin/usuarios" />
      <h1 className="mt-4 text-2xl font-extrabold text-brand-dark">Convidar usuário</h1>
      <p className="mt-2 text-sm text-foreground/60">
        A pessoa recebe um e-mail para definir a própria senha e passa a ter acesso completo ao painel administrativo.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold">
          E-mail
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="pessoa@exemplo.com"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-accent px-5 py-2.5 font-bold text-white disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Enviar convite"}
        </button>
      </form>
    </div>
  );
}
