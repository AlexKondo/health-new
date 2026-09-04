"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = {
  title: string;
  image_url: string;
  link_url?: string | null;
  alt?: string | null;
};

export default function Hero({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const n = banners.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  if (n === 0) return null;
  const b = banners[i];

  const slide = (
    <div className="relative aspect-[1920/650] w-full overflow-hidden">
      <Image
        key={b.image_url}
        src={b.image_url}
        alt={b.alt || b.title}
        fill
        priority
        sizes="100vw"
        className="object-cover animate-kenburns"
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
    </div>
  );

  return (
    <section className="relative">
      {b.link_url ? <Link href={b.link_url}>{slide}</Link> : slide}

      {n > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Banner ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-white" : "w-2.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
