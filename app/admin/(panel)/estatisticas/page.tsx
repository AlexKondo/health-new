import Link from "next/link";
import { requireUser } from "@/lib/admin";
import DeleteForm from "@/components/admin/DeleteForm";
import { deleteStat } from "./actions";

export default async function EstatisticasPage() {
  const { sb } = await requireUser();
  const { data: stats } = await sb.from("stats").select("*").order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-dark">Números da home</h1>
        <Link href="/admin/estatisticas/novo" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          + Novo número
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/60">
        Faixa de estatísticas exibida logo abaixo do banner principal (ex.: &quot;30+ anos de história&quot;).
      </p>

      <div className="mt-6 space-y-3">
        {(stats ?? []).map((s) => (
          <div key={s.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="w-24 shrink-0 text-2xl font-extrabold text-brand">
              {s.value}
              {s.suffix}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{s.label}</p>
              <p className="text-xs text-foreground/60">ordem {s.sort_order}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/estatisticas/${s.id}`} className="text-sm font-semibold text-brand hover:underline">
                Editar
              </Link>
              <DeleteForm action={deleteStat} id={s.id} confirmText={`Excluir o número "${s.label}"? Essa ação não pode ser desfeita.`}>
                <button className="text-sm text-red-600 hover:underline">Excluir</button>
              </DeleteForm>
            </div>
          </div>
        ))}
        {(!stats || stats.length === 0) && (
          <p className="text-foreground/60">Nenhum número cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
