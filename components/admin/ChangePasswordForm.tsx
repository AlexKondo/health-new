"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SuccessPopup from "@/components/admin/SuccessPopup";

export default function ChangePasswordForm({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("A confirmação não bate com a nova senha.");
      return;
    }

    setLoading(true);
    const sb = createClient();

    // Confirma a senha atual antes de trocar (evita troca por sessão esquecida aberta).
    // Não passa pelo bloqueio progressivo do login público: essa tela já exige uma
    // sessão de admin válida, e compartilhar o mesmo contador deixaria um admin
    // logado se autobloquear (até permanentemente) só de digitar a senha atual
    // errada algumas vezes.
    const { error: reauthError } = await sb.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (reauthError) {
      setLoading(false);
      setError("Senha atual incorreta.");
      return;
    }

    const { error: updateError } = await sb.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 max-w-sm">
      <label className="block text-sm font-semibold">
        Senha atual
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
      </label>
      <label className="block text-sm font-semibold">
        Nova senha
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
        className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60 w-fit"
      >
        {loading ? "Salvando…" : "Alterar senha"}
      </button>

      {success && (
        <SuccessPopup message="Senha alterada com sucesso!" onClose={() => setSuccess(false)} />
      )}
    </form>
  );
}
