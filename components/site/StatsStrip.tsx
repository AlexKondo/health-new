"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 30, suffix: "+", label: "anos de história" },
  { value: 150, suffix: "+", label: "alunos" },
  { value: 18, suffix: "", label: "atividades" },
  { value: 5, suffix: "★", label: "avaliação das famílias" },
];

function useCountUp(target: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

function Stat({ value, suffix, label, run }: (typeof STATS)[number] & { run: boolean }) {
  const n = useCountUp(value, run);
  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-extrabold text-white tabular-nums">
        {n}
        <span className="text-accent">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-white/70">{label}</p>
    </div>
  );
}

export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setRun(true), io.disconnect()), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-gradient-to-r from-brand-dark via-brand to-brand-dark bg-[length:200%_auto] animate-[gradient-pan_8s_ease_infinite]">
      <div className="mx-auto max-w-6xl grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        {STATS.map((s) => (
          <Stat key={s.label} {...s} run={run} />
        ))}
      </div>
    </div>
  );
}
