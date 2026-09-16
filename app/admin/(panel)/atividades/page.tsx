import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/admin";
import DeleteForm from "@/components/admin/DeleteForm";
import { ACTIVITY_STYLE, fallbackStyle } from "@/lib/activity-style";
import { deleteActivity } from "./actions";

export default async function AtividadesPage() {
  const { sb } = await requireUser();
  const { data: activities } = await sb.from("activities").select("*").order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-dark">Atividades</h1>
        <Link href="/admin/atividades/novo" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          + Nova atividade
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(activities ?? []).map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-soft">
              {a.tile_image ? (
                <Image src={a.tile_image} alt={a.title} fill className="object-cover" />
              ) : (
                (() => {
                  const st = ACTIVITY_STYLE[a.slug] ?? fallbackStyle;
                  return (
                    <div
                      className="grid h-full w-full place-items-center text-xl"
                      style={{ backgroundImage: `linear-gradient(135deg, ${st.from}, ${st.to})` }}
                    >
                      {st.icon}
                    </div>
                  );
                })()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{a.title}</p>
              <p className="text-xs text-foreground/60">/{a.slug} · {a.category} · ordem {a.sort_order}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/atividades/${a.id}`} className="text-sm font-semibold text-brand hover:underline">
                Editar
              </Link>
              <DeleteForm action={deleteActivity} id={a.id} confirmText={`Excluir a atividade "${a.title}"? Essa ação não pode ser desfeita.`}>
                <button className="text-sm text-red-600 hover:underline">Excluir</button>
              </DeleteForm>
            </div>
          </div>
        ))}
        {(!activities || activities.length === 0) && (
          <p className="text-foreground/60">Nenhuma atividade cadastrada ainda.</p>
        )}
      </div>
    </div>
  );
}
