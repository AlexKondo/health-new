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
          <span className="absolute -right-4 -top-4 text-[7rem] opacity-25 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6 select-none">
            {st.icon}
          </span>
          <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
        {!tile_image && <span className="mb-2 text-4xl drop-shadow-lg">{st.icon}</span>}
        <span className="text-lg font-extrabold text-white drop-shadow-md">{title}</span>
        <span className="mt-1 h-0.5 w-0 bg-white/90 transition-all duration-300 group-hover:w-10" />
      </div>
    </Link>
  );
}
