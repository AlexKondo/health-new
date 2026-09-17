"use client";

import { useState } from "react";

type PanelUser = {
  id: string;
  email: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  pending: boolean;
};

function formatDate(v: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function UsersList({
  initialUsers,
  meId,
  resendInvite,
}: {
  initialUsers: PanelUser[];
  meId: string;
  resendInvite: (formData: FormData) => void | Promise<void>;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [confirming, setConfirming] = useState<PanelUser | null>(null);
  const [error, setError] = useState("");

  async function confirmRemove() {
    const target = confirming;
    if (!target) return;
    setConfirming(null);
    setError("");

    // Tira a linha da tela na hora, antes de qualquer resposta de rede —
    // a chamada real pro Supabase acontece em segundo plano.
    setUsers((prev) => prev.filter((u) => u.id !== target.id));

    const res = await fetch("/api/admin/users/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: target.id }),
    }).catch(() => null);

    const data = await res?.json().catch(() => null);
    if (!res?.ok || !data?.ok) {
      // Reverte: devolve a linha pra lista e avisa o erro.
      setUsers((prev) => [...prev, target].sort((a, b) => (a.createdAt && b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0)));
      setError(data?.error || "Não foi possível remover esse usuário. Tente novamente.");
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {users.map((u) => {
        const isMe = u.id === meId;
        return (
          <div key={u.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-bold truncate">
                {u.email}
                {isMe && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-dark">você</span>}
                {u.pending && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">convite pendente</span>}
              </p>
              <p className="text-xs text-foreground/60">
                Criado em {formatDate(u.createdAt)} · Último acesso {formatDate(u.lastSignInAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {u.pending && (
                <form action={resendInvite}>
                  <input type="hidden" name="email" value={u.email} />
                  <button className="text-sm font-semibold text-brand hover:underline">Reenviar convite</button>
                </form>
              )}
              {!isMe && (
                <button
                  type="button"
                  onClick={() => setConfirming(u)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        );
      })}
      {users.length === 0 && <p className="text-foreground/60">Nenhum usuário encontrado.</p>}

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <p className="font-bold text-brand-dark">Remover acesso?</p>
            <p className="mt-2 text-sm text-foreground/70">
              Remover o acesso de &quot;{confirming.email}&quot;? Essa pessoa não vai mais conseguir entrar no painel.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-brand-soft"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
