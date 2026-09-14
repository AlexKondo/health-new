import Link from "next/link";
import { requireUser } from "@/lib/admin";
import SignOutButton from "@/components/admin/SignOutButton";

const LINKS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/leads", label: "Agendamentos" },
  { href: "/admin/whatsapp", label: "WhatsApp" },
  { href: "/admin/conta", label: "Minha conta" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
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
              className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-white/15 pt-4">
          <p className="text-xs text-white/60 break-all">{user.email}</p>
          <SignOutButton />
          <Link href="/" className="mt-2 block text-xs text-white/60 hover:underline">
            ← Ver o site
          </Link>
        </div>
      </aside>
      <main className="min-w-0 p-6 md:p-10">{children}</main>
    </div>
  );
}
