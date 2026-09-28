import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/admin";
import DeleteForm from "@/components/admin/DeleteForm";
import { deletePartner } from "./actions";

export default async function ParceirosPage() {
  const { sb } = await requireUser();
  const { data: partners } = await sb.from("partners").select("*").order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-dark">Parceiros</h1>
        <Link href="/admin/parceiros/novo" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          + Novo parceiro
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(partners ?? []).map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-brand-soft bg-white">
              {p.logo_url && <Image src={p.logo_url} alt={p.name} fill className="object-contain p-1" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{p.name}</p>
              <p className="text-xs text-foreground/60 truncate">{p.description || "Sem descrição"} · ordem {p.sort_order}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/parceiros/${p.id}`} className="text-sm font-semibold text-brand hover:underline">
                Editar
              </Link>
              <DeleteForm action={deletePartner} id={p.id} confirmText={`Excluir o parceiro "${p.name}"? Essa ação não pode ser desfeita.`}>
                <button className="text-sm text-red-600 hover:underline">Excluir</button>
              </DeleteForm>
            </div>
          </div>
        ))}
        {(!partners || partners.length === 0) && (
          <p className="text-foreground/60">Nenhum parceiro cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
