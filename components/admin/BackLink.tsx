import Link from "next/link";

export default function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
    >
      ← Voltar
    </Link>
  );
}
