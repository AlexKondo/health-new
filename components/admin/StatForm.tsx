"use client";

import { saveStat } from "@/app/admin/(panel)/estatisticas/actions";

type Stat = {
  id?: string;
  value?: number;
  suffix?: string;
  label?: string;
  sort_order?: number;
};

export default function StatForm({ stat }: { stat?: Stat }) {
  return (
    <form action={saveStat} className="grid gap-5 max-w-md">
      {stat?.id && <input type="hidden" name="id" value={stat.id} />}

      <div className="grid grid-cols-2 gap-4">
        <Input name="value" label="Número" type="number" defaultValue={String(stat?.value ?? 0)} required />
        <Input name="suffix" label="Sufixo (opcional)" defaultValue={stat?.suffix ?? ""} placeholder="+ ou ★" />
      </div>
      <Input name="label" label="Rótulo" defaultValue={stat?.label} placeholder="anos de história" required />
      <Input name="sort_order" label="Ordem" type="number" defaultValue={String(stat?.sort_order ?? 0)} />

      <button className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark w-fit">
        Salvar
      </button>
    </form>
  );
}

function Input({
  name, label, type = "text", defaultValue, required, placeholder,
}: {
  name: string; label: string; type?: string;
  defaultValue?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
      />
    </label>
  );
}
