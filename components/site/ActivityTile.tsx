import Image from "next/image";
import Link from "next/link";
import { ACTIVITY_STYLE, fallbackStyle } from "@/lib/activity-style";

type Props = { slug: string; title: string; tile_image?: string | null };

export default function ActivityTile({ slug, title, tile_image }: Props) {
  const st = ACTIVITY_STYLE[slug] ?? fallbackStyle;

  return (
    <Link
      href={`/${slug}`}
      className="group relative block aspect-square overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {tile_image ? (
        <>
          <Image
            src={tile_image}
            alt={title}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </>
      ) : (
        <>
          <span
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `linear-gradient(135deg, ${st.from}, ${st.to})` }}
          />
          <span
            className="absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }}
          />
          <div className="absolute inset-0 flex items-center justify-center pb-10">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-4xl shadow-lg ring-1 ring-white/30 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              {st.icon}
            </span>
          </div>
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        </>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
        <span className="text-lg font-extrabold text-white drop-shadow-md">{title}</span>
        <span className="mt-1 h-0.5 w-0 bg-white/90 transition-all duration-300 group-hover:w-10" />
      </div>
    </Link>
  );
}
