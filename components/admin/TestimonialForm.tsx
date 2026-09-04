"use client";

import { saveTestimonial } from "@/app/admin/(panel)/depoimentos/actions";

type T = {
  id?: string;
  author_name?: string;
  role?: string;
  photo_url?: string | null;
  rating?: number;
  text?: string;
  published?: boolean;
  sort_order?: number;
};

const ROLES = [
  { value: "pai_responsavel", label: "Pai / Responsável" },
  { value: "ex_aluno", label: "Ex-aluno(a)" },
  { value: "colaborador", label: "Colaborador(a)" },
];

export default function TestimonialForm({ t }: { t?: T }) {
  return (
    <form action={saveTestimonial} className="grid gap-4 max-w-xl rounded-2xl bg-white p-6 shadow-sm">
      {t?.id && <input type="hidden" name="id" value={t.id} />}
      <input type="hidden" name="photo_url" value={t?.photo_url ?? ""} />

      <label className="text-sm font-semibold">
        Nome
        <input name="author_name" defaultValue={t?.author_name} required
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm font-semibold">
          Relação
          <select name="role" defaultValue={t?.role ?? "pai_responsavel"}
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal bg-white">
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Nota (1–5)
          <input name="rating" type="number" min={1} max={5} defaultValue={t?.rating ?? 5}
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal" />
        </label>
      </div>

      <label className="text-sm font-semibold">
        Depoimento
        <textarea name="text" rows={5} defaultValue={t?.text} required
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand" />
      </label>

      <label className="text-sm font-semibold">
        Foto (opcional){t?.photo_url && " — já existe; envie para substituir"}
        <input name="photo" type="file" accept="image/*" className="mt-1 block text-sm" />
      </label>

      <div className="grid grid-cols-2 gap-4 items-end">
        <label className="text-sm font-semibold">
          Ordem
          <input name="sort_order" type="number" defaultValue={t?.sort_order ?? 0}
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal" />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold pb-2">
          <input type="checkbox" name="published" defaultChecked={t?.published ?? true} className="h-4 w-4" />
          Publicado
        </label>
      </div>

      <button className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark w-fit">
        Salvar depoimento
      </button>
    </form>
  );
}
