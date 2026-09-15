import Link from "next/link";
import { requireUser } from "@/lib/admin";
import DeleteForm from "@/components/admin/DeleteForm";
import { deleteTestimonial, saveTestimonialsInterval } from "./actions";

const ROLE: Record<string, string> = {
  pai_responsavel: "Pai/Responsável",
  ex_aluno: "Ex-aluno(a)",
  colaborador: "Colaborador(a)",
};

export default async function DepoimentosAdmin() {
  const { sb } = await requireUser();
  const [{ data }, { data: setting }] = await Promise.all([
    sb.from("testimonials").select("*").order("sort_order"),
    sb.from("site_settings").select("value").eq("key", "testimonials_interval_seconds").maybeSingle(),
  ]);
  const intervalSeconds = Number(setting?.value ?? 3);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-dark">Depoimentos</h1>
        <Link href="/admin/depoimentos/novo" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          + Novo depoimento
        </Link>
      </div>

      <form action={saveTestimonialsInterval} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold">
          Troca automática dos cards a cada (segundos, 0 = desativado)
          <input
            name="interval_seconds"
            type="number"
            min={0}
            max={60}
            defaultValue={intervalSeconds}
            className="mt-1 w-40 rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        <button className="rounded-full bg-brand px-5 py-2 font-bold text-white hover:bg-brand-dark">
          Salvar
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {(data ?? []).map((t) => (
          <div key={t.id} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex-1 min-w-0">
              <p className="font-bold">
                {t.author_name}{" "}
                <span className="text-xs font-normal text-foreground/50">· {ROLE[t.role] ?? t.role}</span>
                {!t.published && <span className="ml-2 rounded bg-gray-100 px-1.5 text-xs text-gray-500">rascunho</span>}
              </p>
              <p className="truncate text-sm text-foreground/60">{t.text}</p>
            </div>
            <Link href={`/admin/depoimentos/${t.id}`} className="text-sm font-semibold text-brand hover:underline">
              Editar
            </Link>
            <DeleteForm action={deleteTestimonial} id={t.id} confirmText={`Excluir o depoimento de "${t.author_name}"? Essa ação não pode ser desfeita.`}>
              <button className="text-sm text-red-600 hover:underline">Excluir</button>
            </DeleteForm>
          </div>
        ))}
        {(!data || data.length === 0) && <p className="text-foreground/60">Nenhum depoimento ainda.</p>}
      </div>
    </div>
  );
}
