import Image from "next/image";
import Link from "next/link";
import { CONTACT, NAV } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="mt-20 bg-brand-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Image
            src="/images/Logo-monocromatico.png"
            alt="Escola Saúde"
            width={180}
            height={70}
            className="h-14 w-auto brightness-0 invert"
          />
          <p className="mt-4 text-sm text-white/80">{CONTACT.address}</p>
        </div>

        <div>
          <h3 className="font-bold mb-3">Horário de Funcionamento</h3>
          <p className="text-sm text-white/80">{CONTACT.hours}</p>
          <h3 className="font-bold mt-5 mb-3">Contate-nos</h3>
          <ul className="text-sm text-white/80 space-y-1">
            <li>Tel: {CONTACT.phone}</li>
            <li>WhatsApp: {CONTACT.whatsapp}</li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:underline break-all">
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">Navegação</h3>
          <ul className="text-sm text-white/80 space-y-1">
            {NAV.flatMap((n) => (n.children ? n.children : n.href ? [{ label: n.label, href: n.href }] : []))
              .slice(0, 10)
              .map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">Outros Links</h3>
          <ul className="text-sm text-white/80 space-y-1">
            <li><Link href="/politica-de-privacidade" className="hover:underline">Política de Privacidade</Link></li>
            <li><Link href="/termos-de-uso" className="hover:underline">Termos de Uso</Link></li>
            <li><Link href="/faq" className="hover:underline">Perguntas Frequentes</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Escola Saúde · CNPJ 03.849.236/0001-95
      </div>
    </footer>
  );
}
