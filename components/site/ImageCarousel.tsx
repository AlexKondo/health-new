"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImageCarousel({
  images,
  intervalSeconds = 3,
}: {
  images: { id: string; image_url: string }[];
  intervalSeconds?: number;
}) {
  const [i, setI] = useState(0);
  const n = images.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), Math.max(1, intervalSeconds) * 1000);
    return () => clearInterval(t);
  }, [n, intervalSeconds]);

  if (n === 0) return null;

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-2xl shadow-lg md:h-64">
      {images.map((img, idx) => (
        <Image
          key={img.id}
          src={img.image_url}
          alt="Nossa História"
          fill
          className={`object-cover transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
          priority={idx === 0}
        />
      ))}

      {n > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              aria-label={`Foto ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-6 bg-white" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
