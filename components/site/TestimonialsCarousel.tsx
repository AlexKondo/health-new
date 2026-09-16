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

const CARD_GAP_PX = 24; // deve bater com o gap-6 usado na trilha

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

function Card({ t, onExpand }: { t: T; onExpand: () => void }) {
  return (
    <article className="flex h-[400px] w-full flex-col rounded-3xl bg-white p-6 shadow-xl shadow-brand-dark/5 ring-1 ring-black/5">
      <div className="text-accent text-lg mb-3">{"★".repeat(t.rating)}</div>
      <p className="flex-1 overflow-hidden text-sm text-foreground/80 line-clamp-[10]">{t.text}</p>
      <button
        onClick={onExpand}
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
  );
}

export default function TestimonialsCarousel({
  items,
  intervalSeconds = 0,
}: {
  items: T[];
  intervalSeconds?: number;
}) {
  const n = items.length;
  // Trilha triplicada: sempre há espaço pra andar pra frente e pra trás sem
  // esbarrar na ponta, e a gente "teleporta" sem transição de volta pra cópia
  // do meio quando o índice sai da faixa segura — dá a ilusão de loop infinito.
  const loopedItems = n > 1 ? [...items, ...items, ...items] : items;
  const [index, setIndex] = useState(n);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState<T | null>(null);
  const [stepPx, setStepPx] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function measure() {
      if (firstCardRef.current) setStepPx(firstCardRef.current.offsetWidth + CARD_GAP_PX);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [n]);

  // Corrige o índice de volta pra faixa [n, 2n) sem transição, depois de a
  // animação da troca anterior já ter terminado.
  useEffect(() => {
    if (n <= 1) return;
    if (index >= n && index < n * 2) return;
    const t = setTimeout(() => {
      setAnimated(false);
      setIndex((i) => (i >= n * 2 ? i - n : i + n));
    }, 650);
    return () => clearTimeout(t);
  }, [index, n]);

  useEffect(() => {
    if (animated) return;
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, [animated]);

  useEffect(() => {
    if (!intervalSeconds || intervalSeconds <= 0 || n <= 1 || paused) return;
    timerRef.current = setInterval(() => setIndex((i) => i + 1), intervalSeconds * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalSeconds, n, paused]);

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
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-6"
          style={{
            transform: stepPx ? `translateX(-${index * stepPx}px)` : undefined,
            transition: animated ? "transform 600ms ease" : "none",
          }}
        >
          {loopedItems.map((t, idx) => (
            <div key={idx} ref={idx === 0 ? firstCardRef : undefined} className="w-full shrink-0 md:w-[calc((100%-3rem)/3)]">
              <Card t={t} onExpand={() => setExpanded(t)} />
            </div>
          ))}
        </div>
      </div>

      {n > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setIndex((i) => i - 1)}
            className="h-10 w-10 rounded-full border border-brand-soft hover:bg-brand-soft"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="h-10 w-10 rounded-full border border-brand-soft hover:bg-brand-soft"
            aria-label="Próximo"
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
