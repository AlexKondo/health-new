import Link from "next/link";
import { requireUser } from "@/lib/admin";

async function count(sb: Awaited<ReturnType<typeof requireUser>>["sb"], table: string, filter?: [string, unknown]) {
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default async function Dashboard() {
  const { sb } = await requireUser();
  const [banners, testimonials, leadsNovos, { data: stats }] = await Promise.all([
    count(sb, "banners"),
    count(sb, "testimonials"),
    count(sb, "leads", ["status", "novo"]),
    sb.rpc("visit_stats").single<{ total_visits: number; avg_duration_seconds: number }>(),
  ]);
  const visits = stats?.total_visits ?? 0;
  const avgSeconds = Math.round(stats?.avg_duration_seconds ?? 0);

  const cards = [
    { label: "Visitas", value: visits, href: undefined },
    { label: "Tempo médio no site", value: formatDuration(avgSeconds), href: undefined },
    { label: "Banners ativos", value: banners, href: "/admin/banners" },
    { label: "Depoimentos", value: testimonials, href: "/admin/depoimentos" },
    { label: "Agendamentos novos", value: leadsNovos, href: "/admin/leads" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Visão geral</h1>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {cards.map((c) =>
          c.href ? (
            <Link key={c.label} href={c.href} className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md">
              <p className="text-sm text-foreground/60">{c.label}</p>
              <p className="mt-1 text-3xl font-extrabold text-brand">{c.value}</p>
            </Link>
          ) : (
            <div key={c.label} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-foreground/60">{c.label}</p>
              <p className="mt-1 text-3xl font-extrabold text-brand">{c.value}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
