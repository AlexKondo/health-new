"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const GAP_PX = 16; // deve bater com o gap-4 usado na trilha

export default function ImageCarousel({
  images,
  intervalSeconds = 3,
  visible = 5,
}: {
  images: { id: string; image_url: string }[];
  intervalSeconds?: number;
  visible?: number;
}) {
  const n = images.length;
  // Mesmo truque do carrossel de depoimentos: trilha triplicada pra poder
  // andar infinitamente pra frente sem transição visível de volta.
  const loopedItems = n > visible ? [...images, ...images, ...images] : images;
  const [index, setIndex] = useState(n > visible ? n : 0);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const [stepPx, setStepPx] = useState(0);
  const firstItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function measure() {
      if (firstItemRef.current) setStepPx(firstItemRef.current.offsetWidth + GAP_PX);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [n]);

  useEffect(() => {
    if (n <= visible) return;
    if (index >= n && index < n * 2) return;
    const t = setTimeout(() => {
      setAnimated(false);
      setIndex((i) => (i >= n * 2 ? i - n : i + n));
    }, 650);
    return () => clearTimeout(t);
  }, [index, n, visible]);

  useEffect(() => {
    if (animated) return;
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, [animated]);

  useEffect(() => {
    if (!intervalSeconds || intervalSeconds <= 0 || n <= visible || paused) return;
    const t = setInterval(() => setIndex((i) => i + 1), intervalSeconds * 1000);
    return () => clearInterval(t);
  }, [intervalSeconds, n, visible, paused]);

  if (n === 0) return null;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="overflow-hidden">
      <div
        className="flex gap-4"
        style={{
          transform: stepPx ? `translateX(-${index * stepPx}px)` : undefined,
          transition: animated ? "transform 600ms ease" : "none",
        }}
      >
        {loopedItems.map((img, idx) => (
          <div
            key={idx}
            ref={idx === 0 ? firstItemRef : undefined}
            className="relative h-80 w-full shrink-0 overflow-hidden rounded-2xl shadow-lg sm:w-1/2 md:w-1/3 lg:w-1/5"
          >
            <Image src={img.image_url} alt="Escola Saúde" fill className="object-cover" sizes="(max-width: 768px) 100vw, 20vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
