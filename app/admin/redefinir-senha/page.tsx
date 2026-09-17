"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import SuccessPopup from "@/components/admin/SuccessPopup";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // O Supabase manda erro (link expirado/já usado) tanto na query string
    // quanto no hash da URL — detecta os dois pra avisar na hora, sem
    // esperar o timeout de "não ficou pronto".
    const fromQuery = new URLSearchParams(window.location.search);
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = fromQuery.get("error_code") || fromHash.get("error_code");
    if (code === "otp_expired") {
      setLinkError("Esse link já foi usado ou expirou — cada link só funciona uma vez.");
    } else if (fromQuery.get("error") || fromHash.get("error")) {
      setLinkError("Esse link não é válido.");
    }

    const sb = createClient();
    // O link do e-mail estabelece uma sessão de recuperação client-side.
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const timer = setTimeout(() => setTimedOut(true), 4000);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("A confirmação não bate com a nova senha.");
      return;
    }
    setLoading(true);
    const sb = createClient();
    const { error: updateError } = await sb.auth.updateUser({ password });
    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }
    // Marca a senha como definida (fora do JWT atual — precisa de service
    // role) e atualiza a sessão local pra já refletir isso, senão o
    // middleware manda de volta pra cá mesmo depois de salvar a senha.
    await fetch("/api/auth/mark-password-set", { method: "POST" });
    await sb.auth.refreshSession();
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-brand-soft px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <Image src="/images/logo.png" alt="Escola Saúde" width={160} height={60} className="mx-auto h-12 w-auto" />
        <h1 className="mt-6 text-center text-xl font-extrabold text-brand-dark">Definir nova senha</h1>

        {!ready ? (
          <div className="mt-6 text-center text-sm text-foreground/60">
            {linkError ? (
              <p className="font-semibold text-red-600">{linkError}</p>
            ) : (
              <p>Abra esta página pelo link enviado ao seu e-mail.</p>
            )}
            {(timedOut || linkError) && (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-left text-amber-800">
                <p className="font-semibold">Esse link não funcionou.</p>
                <p className="mt-1">Motivos comuns:</p>
                <ul className="mt-1 list-disc pl-4">
                  <li>O link já foi usado antes (cada link só funciona uma vez)</li>
                  <li>
                    Ele foi colado num app de mensagens (WhatsApp, Telegram) antes de você clicar — o app
                    gera uma prévia da página e isso pode invalidar o link
                  </li>
                  <li>O link expirou (validade limitada)</li>
                </ul>
                <p className="mt-2">Peça para reenviarem o convite/redefinição e clique direto no link do e-mail, sem colar em nenhum chat antes.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="block text-sm font-semibold">
              Nova senha
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm font-semibold">
              Confirmar nova senha
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-brand px-4 py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "Salvando…" : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>

      {success && (
        <SuccessPopup
          message="Senha redefinida com sucesso!"
          onClose={() => {
            setSuccess(false);
            router.replace("/admin/login");
          }}
        />
      )}
    </div>
  );
}
