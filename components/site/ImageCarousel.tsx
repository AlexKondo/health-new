"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const GAP_PX = 16;

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
  const loopedItems = n > visible ? [...images, ...images, ...images] : images;
  const [index, setIndex] = useState(n > visible ? n : 0);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const [stepPx, setStepPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
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
    if (!intervalSeconds || intervalSeconds <= 0 || n <= visible || paused || isDragging) return;
    const t = setInterval(() => setIndex((i) => i + 1), intervalSeconds * 1000);
    return () => clearInterval(t);
  }, [intervalSeconds, n, visible, paused, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = dragStart - e.clientX;
    if (Math.abs(diff) > 5 && stepPx > 0) {
      const steps = Math.round(diff / stepPx);
      if (steps !== 0) {
        setAnimated(false);
        setIndex((i) => i + steps);
        setDragStart(e.clientX);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePrev = () => {
    setAnimated(true);
    setIndex((i) => i - 1);
  };

  const handleNext = () => {
    setAnimated(true);
    setIndex((i) => i + 1);
  };

  if (n === 0) return null;

  return (
    <div className="group relative">
      {n > visible && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-6 rounded-full bg-brand/80 p-2 text-white transition hover:bg-brand disabled:opacity-50"
            aria-label="Foto anterior"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-6 rounded-full bg-brand/80 p-2 text-white transition hover:bg-brand disabled:opacity-50"
            aria-label="Próxima foto"
          >
            →
          </button>
        </>
      )}
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          handleMouseUp();
        }}
        className="overflow-hidden"
      >
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex gap-4"
          style={{
            transform: stepPx ? `translateX(-${index * stepPx}px)` : undefined,
            transition: animated ? "transform 600ms ease" : "none",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          {loopedItems.map((img, idx) => (
            <div
              key={idx}
              ref={idx === 0 ? firstItemRef : undefined}
              className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl shadow-lg sm:w-1/2 md:w-1/3 lg:w-1/5"
              draggable={false}
            >
              <Image
                src={img.image_url}
                alt="Escola Saúde"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 20vw"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
