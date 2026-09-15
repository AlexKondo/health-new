"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NAV } from "@/lib/nav";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-brand-soft">
      <div className="mx-auto max-w-7xl px-4 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center" aria-label="Escola Saúde — início">
          <Image src="/images/logo.png" alt="Escola Saúde" width={170} height={64} priority className="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label} className="relative group">
                <button className="px-3 py-2 text-base font-semibold text-foreground hover:text-brand transition-colors">
                  {item.label}
                  <span className="ml-1 text-xs">▾</span>
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block pt-1">
                  <ul className="min-w-56 rounded-xl border border-brand-soft bg-white shadow-lg p-2">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-soft hover:text-brand-dark"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className="px-3 py-2 text-base font-semibold text-foreground hover:text-brand transition-colors"
              >
                {item.label}
              </Link>
            ),
          )}
          <Link
            href="/#agendar"
            className="ml-2 rounded-full bg-brand-dark px-4 py-2 text-base font-bold text-white hover:brightness-95"
          >
            Agende uma visita
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-2xl"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="lg:hidden border-t border-brand-soft bg-white px-4 py-3">
          {NAV.map((item) => (
            <div key={item.label} className="py-1">
              {item.href ? (
                <Link href={item.href} className="block py-2 font-semibold" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ) : (
                <details>
                  <summary className="py-2 font-semibold cursor-pointer">{item.label}</summary>
                  <ul className="pl-4 pb-2">
                    {item.children!.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="block py-1.5 text-sm" onClick={() => setOpen(false)}>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
          <Link
            href="/#agendar"
            className="mt-2 block rounded-full bg-brand-dark px-4 py-2 text-center font-bold text-white"
            onClick={() => setOpen(false)}
          >
            Agende uma visita
          </Link>
        </nav>
      )}
    </header>
  );
}
