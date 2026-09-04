"use client";

import { useState } from "react";

type Item = { question: string; answer: string };

export default function FaqAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-brand-soft rounded-2xl border border-brand-soft bg-white">
      {items.map((it, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold hover:text-brand"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {it.question}
            <span className="text-brand text-xl shrink-0">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="px-5 pb-5 text-sm text-foreground/75">{it.answer}</p>}
        </div>
      ))}
    </div>
  );
}
