import Link from "next/link";
import { requireUser } from "@/lib/admin";

async function count(sb: Awaited<ReturnType<typeof requireUser>>["sb"], table: string, filter?: [string, unknown]) {
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

export default async function Dashboard() {
  const { sb } = await requireUser();
  const [banners, testimonials, leadsNovos] = await Promise.all([
    count(sb, "banners"),
    count(sb, "testimonials"),
    count(sb, "leads", ["status", "novo"]),
  ]);

  const cards = [
    { label: "Banners ativos", value: banners, href: "/admin/banners" },
    { label: "Depoimentos", value: testimonials, href: "/admin/depoimentos" },
    { label: "Agendamentos novos", value: leadsNovos, href: "/admin/leads" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Visão geral</h1>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md">
            <p className="text-sm text-foreground/60">{c.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
