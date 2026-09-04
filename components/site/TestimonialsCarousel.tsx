"use client";

import Image from "next/image";
import { useState } from "react";

type T = {
  author_name: string;
  role: string;
  photo_url?: string | null;
  rating: number;
  text: string;
};

const ROLE_LABEL: Record<string, string> = {
  pai_responsavel: "Pai / Responsável",
  ex_aluno: "Ex-aluno(a)",
  colaborador: "Colaborador(a)",
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function TestimonialsCarousel({ items }: { items: T[] }) {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pages = Math.ceil(items.length / perPage);
  const slice = items.slice(page * perPage, page * perPage + perPage);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {slice.map((t, idx) => (
          <article key={idx} className="rounded-2xl border border-brand-soft bg-white p-6 shadow-sm flex flex-col">
            <div className="text-accent text-lg mb-3">{"★".repeat(t.rating)}</div>
            <p className="text-sm text-foreground/80 flex-1 line-clamp-[10]">{t.text}</p>
            <div className="mt-5 flex items-center gap-3">
              {t.photo_url ? (
                <Image
                  src={t.photo_url}
                  alt={t.author_name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="h-12 w-12 rounded-full bg-brand-soft text-brand-dark grid place-items-center font-bold">
                  {initials(t.author_name)}
                </span>
              )}
              <div>
                <p className="font-bold text-sm">{t.author_name}</p>
                <p className="text-xs text-foreground/60">{ROLE_LABEL[t.role] ?? t.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => (p - 1 + pages) % pages)}
            className="h-10 w-10 rounded-full border border-brand-soft hover:bg-brand-soft"
            aria-label="Anteriores"
          >
            ‹
          </button>
          <span className="text-sm text-foreground/60">
            {page + 1} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => (p + 1) % pages)}
            className="h-10 w-10 rounded-full border border-brand-soft hover:bg-brand-soft"
            aria-label="Próximos"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
