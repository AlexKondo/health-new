"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

function formatWait(seconds: number) {
  if (seconds < 60) return `${seconds} segundo${seconds === 1 ? "" : "s"}`;
  const m = Math.ceil(seconds / 60);
  return `${m} minuto${m === 1 ? "" : "s"}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.blocked) {
          setError(
            data.permanent
              ? "Conta bloqueada por excesso de tentativas. Fale com o suporte técnico para desbloquear."
              : `Muitas tentativas erradas. Tente novamente em ${formatWait(data.retryAfterSeconds)}.`,
          );
        } else {
          setError("E-mail ou senha inválidos.");
        }
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor de login. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  async function onForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const sb = createClient();
      await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/redefinir-senha`,
      });
    } finally {
      setLoading(false);
      // Sempre mostra a mesma mensagem, exista o e-mail ou não.
      setForgotSent(true);
    }
  }

  if (mode === "forgot") {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-soft px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
          <Image src="/images/logo.png" alt="Escola Saúde" width={160} height={60} className="mx-auto h-12 w-auto" />
          <h1 className="mt-6 text-center text-xl font-extrabold text-brand-dark">Recuperar senha</h1>

          {forgotSent ? (
            <p className="mt-6 text-center text-sm text-foreground/70">
              Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha.
            </p>
          ) : (
            <form onSubmit={onForgotSubmit} className="mt-6">
              <label className="block text-sm font-semibold">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
                />
              </label>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-full bg-brand px-4 py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar link de recuperação"}
              </button>
            </form>
          )}

          <button
            onClick={() => {
              setMode("login");
              setForgotSent(false);
              setError("");
            }}
            className="mt-4 block w-full text-center text-sm font-semibold text-brand hover:underline"
          >
            ← Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-brand-soft px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <Image src="/images/logo.png" alt="Escola Saúde" width={160} height={60} className="mx-auto h-12 w-auto" />
        <h1 className="mt-6 text-center text-xl font-extrabold text-brand-dark">Painel administrativo</h1>
        <label className="mt-6 block text-sm font-semibold">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setMode("forgot");
            setError("");
          }}
          className="mt-2 text-sm font-semibold text-brand hover:underline"
        >
          Esqueci minha senha
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-brand px-4 py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
