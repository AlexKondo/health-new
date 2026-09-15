"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

function Avatar({ t }: { t: T }) {
  return t.photo_url ? (
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
  );
}

export default function TestimonialsCarousel({
  items,
  intervalSeconds = 0,
}: {
  items: T[];
  intervalSeconds?: number;
}) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState<T | null>(null);
  const perPage = 3;
  const pages = Math.ceil(items.length / perPage);
  const slice = items.slice(page * perPage, page * perPage + perPage);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!intervalSeconds || intervalSeconds <= 0 || pages <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setPage((p) => (p + 1) % pages);
    }, intervalSeconds * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalSeconds, pages, paused]);

  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="grid gap-6 md:grid-cols-3">
        {slice.map((t, idx) => (
          <article
            key={idx}
            className="flex flex-col rounded-3xl bg-white p-6 shadow-xl shadow-brand-dark/5 ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1.5"
          >
            <div className="text-accent text-lg mb-3">{"★".repeat(t.rating)}</div>
            <p className="flex-1 text-sm text-foreground/80 line-clamp-[10]">{t.text}</p>
            <button
              onClick={() => setExpanded(t)}
              className="mt-2 self-start text-sm font-bold text-brand hover:underline"
            >
              Ler tudo
            </button>
            <div className="mt-5 flex items-center gap-3">
              <Avatar t={t} />
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

      {expanded && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpanded(null)}
              className="float-right -mt-2 -mr-2 text-2xl text-foreground/40 hover:text-foreground"
              aria-label="Fechar"
            >
              ×
            </button>
            <div className="text-accent text-lg mb-3">{"★".repeat(expanded.rating)}</div>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{expanded.text}</p>
            <div className="mt-6 flex items-center gap-3">
              <Avatar t={expanded} />
              <div>
                <p className="font-bold text-sm">{expanded.author_name}</p>
                <p className="text-xs text-foreground/60">{ROLE_LABEL[expanded.role] ?? expanded.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
