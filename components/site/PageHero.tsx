import Image from "next/image";

export default function PageHero({
  title,
  image,
  subtitle,
}: {
  title: string;
  image?: string | null;
  subtitle?: string;
}) {
  return (
    <div className="relative bg-brand-dark text-white">
      {image && (
        <Image src={image} alt={title} fill priority className="object-cover opacity-30" />
      )}
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/85">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-4 text-foreground/80 leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/**
 * Renderiza texto salvo pelo editor rico do admin (HTML). Conteúdo antigo,
 * ainda em texto simples (parágrafos separados por linha em branco), continua
 * funcionando via o fallback de `Prose`.
 */
export function RichBody({ content }: { content?: string | null }) {
  if (!content) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div
        className="prose-body text-foreground/80 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  const paragraphs = content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return <Prose paragraphs={paragraphs} />;
}

export function VisitCTA() {
  return (
    <div className="mt-12 rounded-3xl bg-brand-soft p-8 text-center">
      <h3 className="text-2xl font-extrabold text-brand-dark">Venha nos conhecer</h3>
      <p className="mt-2 text-foreground/70">
        Agende uma visita e veja de perto o cuidado da Escola Saúde com cada criança.
      </p>
      <a
        href="/#agendar"
        className="mt-5 inline-block rounded-full bg-accent px-6 py-3 font-bold text-white hover:brightness-95"
      >
        Agendar visita
      </a>
    </div>
  );
}
