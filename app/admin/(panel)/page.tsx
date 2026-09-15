import Link from "next/link";
import { requireUser } from "@/lib/admin";
import EditableVisits from "@/components/admin/EditableVisits";
import EditableDuration from "@/components/admin/EditableDuration";

async function count(sb: Awaited<ReturnType<typeof requireUser>>["sb"], table: string, filter?: [string, unknown]) {
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

export default async function Dashboard() {
  const { sb } = await requireUser();
  const [banners, testimonials, leadsNovos, { data: stats }, { data: settings }] = await Promise.all([
    count(sb, "banners"),
    count(sb, "testimonials"),
    count(sb, "leads", ["status", "novo"]),
    sb.rpc("visit_stats").single<{ total_visits: number; avg_duration_seconds: number }>(),
    sb.from("site_settings").select("key,value").in("key", ["visits_override", "avg_duration_override_seconds"]),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const row of settings ?? []) settingsMap[row.key] = row.value ?? "";

  const visitsOverride = settingsMap.visits_override || "";
  const visits = visitsOverride !== "" ? Number(visitsOverride) : stats?.total_visits ?? 0;

  const durationOverride = settingsMap.avg_duration_override_seconds || "";
  const avgSeconds = Math.round(durationOverride !== "" ? Number(durationOverride) : stats?.avg_duration_seconds ?? 0);

  const otherCards = [
    { label: "Banners ativos", value: banners, href: "/admin/banners" },
    { label: "Depoimentos", value: testimonials, href: "/admin/depoimentos" },
    { label: "Agendamentos novos", value: leadsNovos, href: "/admin/leads" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Visão geral</h1>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <EditableVisits value={visits} overridden={visitsOverride !== ""} rawOverride={visitsOverride} />
        <EditableDuration
          minutes={Math.floor(avgSeconds / 60)}
          seconds={avgSeconds % 60}
          overridden={durationOverride !== ""}
        />
        {otherCards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md">
            <p className="text-sm text-foreground/60">{c.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
