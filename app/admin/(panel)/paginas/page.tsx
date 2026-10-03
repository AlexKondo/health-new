import Link from "next/link";
import { requireUser } from "@/lib/admin";
import { getEditablePages } from "@/lib/content";

const OWN_EDITORS = [
  { href: "/admin/sobre-nos", label: "Sobre nós", path: "/#sobre" },
  { href: "/admin/nossa-historia", label: "Nossa História", path: "/nossa-historia" },
  { href: "/admin/diferenciais", label: "Diferenciais", path: "/diferenciais" },
  { href: "/admin/infraestrutura", label: "Infraestrutura", path: "/infraestrutura" },
  { href: "/admin/parceiros", label: "Parceiros", path: "/parceiros" },
];

function Row({ href, title, hint, badge }: { href: string; title: string; hint: string; badge?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{title}</p>
        <p className="text-xs text-foreground/60">{hint}</p>
      </div>
      {badge && <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-dark">{badge}</span>}
      <Link href={href} className="text-sm font-semibold text-brand hover:underline">
        Editar
      </Link>
    </div>
  );
}

export default async function PaginasAdmin() {
  const { sb } = await requireUser();
  const [{ data: segments }, { data: activities }, { data: custom }] = await Promise.all([
    sb.from("segments").select("id,slug,title,published").order("sort_order"),
    sb.from("activities").select("id,slug,title,category").order("sort_order"),
    sb.from("site_pages").select("slug"),
  ]);
  const customized = new Set((custom ?? []).map((c) => c.slug));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-brand-dark">Páginas do site</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Todas as páginas internas num lugar só. Em cada uma você edita título, banner, texto e o carrossel de fotos.
      </p>

      <h2 className="mt-8 text-lg font-extrabold text-brand-dark">Segmentos</h2>
      <div className="mt-3 space-y-2">
        {(segments ?? []).map((s) => (
          <Row
            key={s.id}
            href={`/admin/segmentos/${s.id}`}
            title={s.title}
            hint={`/${s.slug}`}
            badge={s.published === false ? "Despublicada" : undefined}
          />
        ))}
      </div>

      <h2 className="mt-8 text-lg font-extrabold text-brand-dark">Atividades</h2>
      <div className="mt-3 space-y-2">
        {(activities ?? []).map((a) => (
          <Row
            key={a.id}
            href={`/admin/atividades/${a.id}`}
            title={a.title}
            hint={`/${a.slug} · ${a.category === "curricular" ? "curricular" : "extracurricular"}`}
          />
        ))}
      </div>

      <h2 className="mt-8 text-lg font-extrabold text-brand-dark">Páginas institucionais</h2>
      <div className="mt-3 space-y-2">
        {OWN_EDITORS.map((p) => (
          <Row key={p.href} href={p.href} title={p.label} hint={p.path} />
        ))}
        {getEditablePages().map((p) => (
          <Row
            key={p.slug}
            href={`/admin/paginas/${p.slug}`}
            title={p.title}
            hint={`/${p.slug}`}
            badge={customized.has(p.slug) ? "Editada" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
