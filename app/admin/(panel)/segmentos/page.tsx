import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/admin";
import DeleteForm from "@/components/admin/DeleteForm";
import { deleteSegment } from "./actions";

export default async function SegmentosPage() {
  const { sb } = await requireUser();
  const { data: segments } = await sb.from("segments").select("*").order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-dark">Segmentos</h1>
        <Link href="/admin/segmentos/novo" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          + Novo segmento
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(segments ?? []).map((s) => (
          <div key={s.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-soft">
              {(s.card_image || s.hero_image) && (
                <Image src={s.card_image || s.hero_image} alt={s.title} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{s.title}</p>
              <p className="text-xs text-foreground/60">/{s.slug} · ordem {s.sort_order}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/segmentos/${s.id}`} className="text-sm font-semibold text-brand hover:underline">
                Editar
              </Link>
              <DeleteForm action={deleteSegment} id={s.id} confirmText={`Excluir o segmento "${s.title}"? Essa ação não pode ser desfeita.`}>
                <button className="text-sm text-red-600 hover:underline">Excluir</button>
              </DeleteForm>
            </div>
          </div>
        ))}
        {(!segments || segments.length === 0) && (
          <p className="text-foreground/60">Nenhum segmento cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
