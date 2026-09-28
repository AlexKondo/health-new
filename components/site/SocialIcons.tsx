type SocialLinks = { instagram: string; facebook: string; youtube: string };

const ICONS: Record<keyof SocialLinks, { label: string; path: string }> = {
  instagram: {
    label: "Instagram",
    path: "M16 3H8a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5Zm3 13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8ZM12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.7A3 3 0 1 1 15 12a3 3 0 0 1-3 3Zm4.9-8.6a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1Z",
  },
  facebook: {
    label: "Facebook",
    path: "M13.5 21v-7.5h2.5l.4-3h-2.9V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3C16.3 4.24 15.4 4.15 14.3 4.15c-2.3 0-3.8 1.4-3.8 3.96V10.5H8v3h2.5V21Z",
  },
  youtube: {
    label: "YouTube",
    path: "M21.6 7.6a2.7 2.7 0 0 0-1.9-1.9C18 5.2 12 5.2 12 5.2s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.6 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.4 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.4ZM10 15V9l5.2 3Z",
  },
};

export default function SocialIcons({ social, className = "" }: { social: SocialLinks; className?: string }) {
  const entries = (Object.keys(ICONS) as (keyof SocialLinks)[]).filter((k) => social[k]);
  if (entries.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {entries.map((k) => (
        <a
          key={k}
          href={social[k]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ICONS[k].label}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
            <path d={ICONS[k].path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
