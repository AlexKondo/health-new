"use client";

import { useState, useTransition } from "react";

const STATUSES = ["novo", "contatado", "agendado", "convertido", "perdido"] as const;
const LABELS: Record<string, string> = {
  novo: "Novo",
  contatado: "Contatado",
  agendado: "Agendado",
  convertido: "Convertido",
  perdido: "Perdido",
};

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  child_grade: string | null;
  period: string | null;
  message: string | null;
  status: string;
  scheduled_at: string | null;
  created_at: string;
};

export default function KanbanBoard({
  leads,
  updateStatus,
}: {
  leads: Lead[];
  updateStatus: (id: string, status: string) => Promise<void>;
}) {
  const [items, setItems] = useState(leads);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function onDrop(status: string) {
    if (!dragId) return;
    const id = dragId;
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    startTransition(() => {
      updateStatus(id, status);
    });
    setDragId(null);
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
      {STATUSES.map((s) => (
        <div
          key={s}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(s)}
          className="min-h-[220px] rounded-2xl bg-brand-soft/50 p-3"
        >
          <p className="mb-3 text-sm font-extrabold text-brand-dark">
            {LABELS[s]}{" "}
            <span className="font-normal text-foreground/40">
              ({items.filter((l) => l.status === s).length})
            </span>
          </p>
          <div className="space-y-2">
            {items
              .filter((l) => l.status === s)
              .map((l) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  className="cursor-grab rounded-xl bg-white p-3 shadow-sm active:cursor-grabbing"
                >
                  <p className="text-sm font-bold">{l.name}</p>
                  {l.scheduled_at && (
                    <p className="mt-1 text-xs font-semibold text-brand">
                      {new Date(l.scheduled_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                  {(l.phone || l.email) && (
                    <p className="mt-1 text-xs text-foreground/60">{l.phone || l.email}</p>
                  )}
                  {(l.child_grade || l.period) && (
                    <p className="text-xs text-foreground/50">
                      {[l.child_grade, l.period].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {l.message && (
                    <p className="mt-1 line-clamp-2 text-xs text-foreground/50">{l.message}</p>
                  )}
                </div>
              ))}
            {items.filter((l) => l.status === s).length === 0 && (
              <p className="text-xs text-foreground/40">Arraste um card aqui</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
