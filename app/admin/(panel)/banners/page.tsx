import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/admin";
import DeleteForm from "@/components/admin/DeleteForm";
import { deleteBanner, toggleBanner } from "./actions";

function windowLabel(s: string | null, e: string | null) {
  if (!s && !e) return "Sempre visível";
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
  return `${s ? fmt(s) : "—"} até ${e ? fmt(e) : "—"}`;
}

export default async function BannersPage() {
  const { sb } = await requireUser();
  const { data: banners } = await sb.from("banners").select("*").order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-dark">Banners</h1>
        <Link href="/admin/banners/novo" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          + Novo banner
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(banners ?? []).map((b) => (
          <div key={b.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="relative h-14 w-40 shrink-0 overflow-hidden rounded-lg bg-brand-soft">
              {b.image_url && <Image src={b.image_url} alt={b.alt || b.title} fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{b.title}</p>
              <p className="text-xs text-foreground/60">
                {windowLabel(b.starts_at, b.ends_at)} · {b.duration_seconds ?? 6}s na tela
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${b.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {b.active ? "Ativo" : "Inativo"}
            </span>
            <div className="flex items-center gap-2">
              <Link href={`/admin/banners/${b.id}`} className="text-sm font-semibold text-brand hover:underline">
                Editar
              </Link>
              <form action={toggleBanner}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="active" value={String(b.active)} />
                <button className="text-sm text-foreground/60 hover:underline">
                  {b.active ? "Desativar" : "Ativar"}
                </button>
              </form>
              <DeleteForm action={deleteBanner} id={b.id} confirmText={`Excluir o banner "${b.title}"? Essa ação não pode ser desfeita.`}>
                <button className="text-sm text-red-600 hover:underline">Excluir</button>
              </DeleteForm>
            </div>
          </div>
        ))}
        {(!banners || banners.length === 0) && (
          <p className="text-foreground/60">Nenhum banner cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
