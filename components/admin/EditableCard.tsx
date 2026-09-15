"use client";

import { useActionState, useEffect, useState } from "react";

type ActionResult = { ok: boolean; error?: string };

export default function EditableCard({
  label,
  displayValue,
  overridden,
  action,
  children,
}: {
  label: string;
  displayValue: React.ReactNode;
  overridden: boolean;
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(async (_prev, formData) => {
    try {
      await action(formData);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Erro ao salvar." };
    }
  }, { ok: false });

  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/60">{label}</p>
          <button onClick={() => setEditing(true)} className="text-xs font-semibold text-brand hover:underline">
            Editar
          </button>
        </div>
        <p className="mt-1 text-3xl font-extrabold text-brand">{displayValue}</p>
        {overridden && <p className="mt-1 text-xs text-foreground/40">valor manual</p>}
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-foreground/60">{label}</p>
      {children}
      {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          name="action"
          value="save"
          disabled={pending}
          className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        {overridden && (
          <button
            type="submit"
            name="action"
            value="clear"
            disabled={pending}
            className="text-xs font-semibold text-foreground/50 hover:underline disabled:opacity-50"
          >
            Usar automático
          </button>
        )}
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={pending}
          className="text-xs text-foreground/40 hover:underline"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
