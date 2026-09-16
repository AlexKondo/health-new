"use client";

import { useRef, useState } from "react";

type Column = {
  id: string;
  key: string;
  label: string;
  sort_order: number;
  is_default: boolean;
  color: string;
  width_px: number;
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
  status_changed_by: string | null;
  status_changed_at: string | null;
  created_at: string;
};

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dayLabel(iso: string) {
  const target = new Date(iso);
  const today = new Date();
  const diffDays = Math.round(
    (new Date(target.toDateString()).getTime() - new Date(today.toDateString()).getTime()) / 86400000,
  );
  if (diffDays === 0) return "HOJE";
  if (diffDays === 1) return "AMANHÃ";
  return null;
}

/** Fila de mutações por chave — garante que, se o usuário mexer rápido
 * várias vezes seguidas na mesma coisa (ex.: arrastar o card por várias
 * colunas em sequência), as chamadas ao servidor cheguem na mesma ordem
 * em que o usuário fez, em vez de correrem em paralelo e possivelmente
 * chegar fora de ordem (o que faria o estado final não bater com o que
 * foi realmente a última ação). */
function useMutationQueue() {
  const queues = useRef<Record<string, Promise<void>>>({});
  return function enqueue(key: string, fn: () => Promise<void>, onError: () => void) {
    const prev = queues.current[key] ?? Promise.resolve();
    const next = prev.then(fn).catch((e) => {
      console.error(e);
      onError();
    });
    queues.current[key] = next;
    return next;
  };
}

function VisitDate({ lead, onSave }: { lead: Lead; onSave: (iso: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(lead.scheduled_at ? toLocalInputValue(lead.scheduled_at) : "");

  if (editing) {
    return (
      <div className="mt-1 flex items-center gap-1">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded border border-brand-soft px-1 py-0.5 text-xs"
          draggable={false}
        />
        <button
          type="button"
          onClick={() => {
            onSave(value ? new Date(value).toISOString() : null);
            setEditing(false);
          }}
          className="text-xs font-bold text-brand"
        >
          ✓
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-foreground/40">
          ✕
        </button>
      </div>
    );
  }

  const label = lead.scheduled_at ? dayLabel(lead.scheduled_at) : null;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
    >
      {lead.scheduled_at ? (
        <>
          {label && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{label}</span>
          )}
          {new Date(lead.scheduled_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </>
      ) : (
        <span className="text-foreground/40">+ definir data da visita</span>
      )}
    </button>
  );
}

function AddColumnForm({ onCreate }: { onCreate: (label: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const trimmed = label.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    const ok = await onCreate(trimmed);
    setSubmitting(false);
    if (ok) {
      setLabel("");
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[220px] w-56 shrink-0 rounded-2xl border-2 border-dashed border-brand-soft p-3 text-sm font-semibold text-foreground/40 hover:border-brand hover:text-brand"
      >
        + Nova coluna
      </button>
    );
  }
  return (
    <div className="min-h-[220px] w-56 shrink-0 rounded-2xl bg-brand-soft/50 p-3">
      <p className="mb-3 text-sm font-extrabold text-brand-dark">Nova coluna</p>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        autoFocus
        placeholder="Nome da coluna"
        className="w-full rounded-lg border border-brand-soft px-2 py-1.5 text-sm"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Criando…" : "Criar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-foreground/50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function KanbanBoard({
  leads,
  columns: initialColumns,
  me,
  updateStatus,
  setScheduledAt,
  addColumn,
  deleteColumn,
  reorderColumns,
  updateColumnStyle,
}: {
  leads: Lead[];
  columns: Column[];
  me: string;
  updateStatus: (id: string, status: string) => Promise<void>;
  setScheduledAt: (id: string, iso: string | null) => Promise<void>;
  addColumn: (label: string) => Promise<Column>;
  deleteColumn: (id: string) => Promise<void>;
  reorderColumns: (orderedIds: string[]) => Promise<void>;
  updateColumnStyle: (id: string, patch: { color?: string; width_px?: number }) => Promise<void>;
}) {
  const [items, setItems] = useState(leads);
  const [columns, setColumns] = useState(initialColumns);
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragColId, setDragColId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const enqueue = useMutationQueue();

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  }

  async function onCreateColumn(label: string) {
    try {
      const created = await addColumn(label);
      setColumns((prev) => [...prev, created]);
      return true;
    } catch (e) {
      showError(e instanceof Error ? e.message : "Não foi possível criar a coluna.");
      return false;
    }
  }

  async function onDeleteColumn(col: Column) {
    if (!window.confirm(`Excluir a coluna "${col.label}"?`)) return;
    try {
      await deleteColumn(col.id);
      setColumns((prev) => prev.filter((c) => c.id !== col.id));
    } catch (e) {
      showError(e instanceof Error ? e.message : "Não foi possível excluir a coluna.");
    }
  }

  function onDropOnColumn(col: Column) {
    if (dragCardId) {
      const id = dragCardId;
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: col.key, status_changed_by: me, status_changed_at: now } : l)),
      );
      setDragCardId(null);
      enqueue(`status:${id}`, () => updateStatus(id, col.key), () =>
        showError(`Não foi possível salvar a mudança de status de "${items.find((l) => l.id === id)?.name}". Recarregue a página e tente de novo.`),
      );
      return;
    }
    if (dragColId && dragColId !== col.id) {
      const from = columns.findIndex((c) => c.id === dragColId);
      const to = columns.findIndex((c) => c.id === col.id);
      if (from === -1 || to === -1) return;
      const next = [...columns];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setColumns(next);
      setDragColId(null);
      enqueue("reorder-columns", () => reorderColumns(next.map((c) => c.id)), () =>
        showError("Não foi possível salvar a nova ordem das colunas. Recarregue a página e tente de novo."),
      );
    }
  }

  function onDateSave(id: string, iso: string | null) {
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, scheduled_at: iso } : l)));
    enqueue(`date:${id}`, () => setScheduledAt(id, iso), () =>
      showError("Não foi possível salvar a data da visita. Recarregue a página e tente de novo."),
    );
  }

  function onColorChange(id: string, color: string) {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)));
    enqueue(`color:${id}`, () => updateColumnStyle(id, { color }), () =>
      showError("Não foi possível salvar a cor da coluna."),
    );
  }

  function startResize(col: Column, e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = col.width_px;
    function onMove(ev: PointerEvent) {
      const width = Math.min(480, Math.max(160, startWidth + (ev.clientX - startX)));
      setColumns((prev) => prev.map((c) => (c.id === col.id ? { ...c, width_px: width } : c)));
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setColumns((prev) => {
        const updated = prev.find((c) => c.id === col.id);
        if (updated) {
          enqueue(`width:${col.id}`, () => updateColumnStyle(col.id, { width_px: updated.width_px }), () =>
            showError("Não foi possível salvar a largura da coluna."),
          );
        }
        return prev;
      });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}
      <div className="flex items-start gap-4">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropOnColumn(col)}
            style={{ width: col.width_px, backgroundColor: col.color }}
            className="relative shrink-0 min-h-[220px] rounded-2xl p-3"
          >
            <div
              draggable
              onDragStart={() => setDragColId(col.id)}
              onDragEnd={() => setDragColId(null)}
              className="mb-3 flex cursor-grab items-center justify-between active:cursor-grabbing"
            >
              <p className="text-sm font-extrabold text-brand-dark">
                {col.label}{" "}
                <span className="font-normal text-foreground/40">
                  ({items.filter((l) => l.status === col.key).length})
                </span>
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={col.color}
                  onPointerDown={(e) => e.stopPropagation()}
                  onChange={(e) => onColorChange(col.id, e.target.value)}
                  title="Cor da coluna"
                  className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                {!col.is_default && (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onDeleteColumn(col)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {items
                .filter((l) => l.status === col.key)
                .map((l) => (
                  <div
                    key={l.id}
                    draggable
                    onDragStart={() => setDragCardId(l.id)}
                    onDragEnd={() => setDragCardId(null)}
                    className="cursor-grab rounded-xl bg-white p-3 shadow-sm active:cursor-grabbing"
                  >
                    <p className="text-sm font-bold">{l.name}</p>
                    <VisitDate lead={l} onSave={(iso) => onDateSave(l.id, iso)} />
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
                    {l.status_changed_by && (
                      <p className="mt-2 border-t border-black/5 pt-1 text-[10px] text-foreground/40">
                        Movido por {l.status_changed_by}
                        {l.status_changed_at &&
                          ` · ${new Date(l.status_changed_at).toLocaleDateString("pt-BR")}`}
                      </p>
                    )}
                  </div>
                ))}
              {items.filter((l) => l.status === col.key).length === 0 && (
                <p className="text-xs text-foreground/40">Arraste um card aqui</p>
              )}
            </div>
            <div
              onPointerDown={(e) => startResize(col, e)}
              title="Arraste para redimensionar"
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize rounded-r-2xl hover:bg-black/10"
            />
          </div>
        ))}
        <AddColumnForm onCreate={onCreateColumn} />
      </div>
    </div>
  );
}
