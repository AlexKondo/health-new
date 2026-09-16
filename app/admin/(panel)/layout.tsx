import Link from "next/link";
import { requireUser } from "@/lib/admin";
import UserMenu from "@/components/admin/UserMenu";

const LINKS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/estatisticas", label: "Números da home" },
  { href: "/admin/segmentos", label: "Segmentos" },
  { href: "/admin/atividades", label: "Atividades" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/leads", label: "Agendamentos" },
  { href: "/admin/whatsapp", label: "WhatsApp" },
  { href: "/admin/trafego", label: "Tráfego pago" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/conta", label: "Minha conta" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, sb } = await requireUser();

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000);
  const [{ count: novoCount }, { count: upcomingCount }] = await Promise.all([
    sb.from("leads").select("*", { count: "exact", head: true }).eq("status", "novo"),
    sb
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "agendado")
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", in24h.toISOString()),
  ]);
  const pendingCount = (novoCount ?? 0) + (upcomingCount ?? 0);

  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr] bg-brand-soft/40">
      <aside className="bg-brand-dark text-white p-5 md:min-h-screen">
        <p className="text-lg font-extrabold">Escola Saúde</p>
        <p className="text-xs text-white/60 mb-6">Painel administrativo</p>
        <nav className="space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              {l.label}
              {l.href === "/admin/leads" && pendingCount > 0 && (
                <span className="relative inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative">{pendingCount}</span>
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-white/15 pt-4">
          <Link href="/" className="block text-xs text-white/60 hover:underline">
            ← Ver o site
          </Link>
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-end border-b border-black/5 bg-white px-6 py-3 md:px-10">
          <UserMenu email={user.email ?? ""} />
        </header>
        <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
