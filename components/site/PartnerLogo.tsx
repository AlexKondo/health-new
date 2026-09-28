"use client";

import { useRef } from "react";
import Image from "next/image";

/**
 * Card do logo do parceiro com efeito 3D: inclina sutilmente seguindo o
 * mouse (como um cartão físico) e tem um brilho tipo holográfico que
 * acompanha o cursor, além do anel giratório e revelação de cor (ver
 * .partner-logo* em globals.css). Funciona bem mesmo em caixas ainda sem
 * logo (placeholder em branco) — o efeito não depende da imagem.
 */
export default function PartnerLogo({ src, alt }: { src?: string | null; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 26}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 26}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div style={{ perspective: "700px" }}>
      <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className="partner-logo">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-brand-soft bg-white">
          {src && <Image src={src} alt={alt} fill className="object-contain p-2" />}
          <span className="partner-logo-shine" />
        </div>
      </div>
    </div>
  );
}
