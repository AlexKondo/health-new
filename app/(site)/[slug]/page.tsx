import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageHero, { Prose, RichBody, VisitCTA } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import Reveal from "@/components/site/Reveal";
import PartnerLogo from "@/components/site/PartnerLogo";
import {
  getSegment, getActivity, getPage, getActivities, getSegments, getPages, getDiferenciais, getPartners,
} from "@/lib/content";

export const dynamicParams = true;

export async function generateStaticParams() {
  const [segs, acts] = [getSegments(), getActivities()];
  const [s, a] = await Promise.all([segs, acts]);
  return [
    ...s.map((x) => ({ slug: x.slug })),
    ...a.map((x) => ({ slug: x.slug })),
    // "diferenciais" fica de fora: o conteúdo dela agora vem do
    // site_settings (editável no admin), não mais do seed estático.
    ...getPages().filter((x) => x.slug !== "diferenciais").map((x) => ({ slug: x.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seg = await getSegment(slug);
  const act = await getActivity(slug);
  const page = getPage(slug);
  const title = seg?.title || act?.title || page?.title;
  return { title: title ?? "Página" };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 0) Diferenciais (conteúdo editável no admin, fora do ar até ser publicado)
  if (slug === "diferenciais") {
    const d = await getDiferenciais();
    if (!d.published) notFound();
    return (
      <>
        <PageHero title={d.title} image={d.heroImage} />
        <Section className="max-w-4xl">
          <RichBody content={d.body} />
        </Section>
      </>
    );
  }

  // 0.5) Parceiros (lista editável no admin, com logo de cada um)
  if (slug === "parceiros") {
    const partners = await getPartners();
    const page = getPage(slug);
    return (
      <>
        <PageHero title={page?.title ?? "Parceiros"} image={page?.hero_image} />
        <Section className="max-w-4xl">
          <div className="space-y-8">
            {partners.map((p, i) => {
              const content = (
                <div className="flex items-start gap-6">
                  <div className="w-24 shrink-0 sm:w-28">
                    <PartnerLogo src={p.logo_url} alt={p.name} />
                  </div>
                  <div className="min-w-0 flex-1 pl-2 pt-1 sm:pl-4">
                    <h3 className="font-extrabold text-brand-dark">{p.name}</h3>
                    {p.description && (
                      <p className="mt-1 text-foreground/80 leading-relaxed">{p.description}</p>
                    )}
                  </div>
                </div>
              );
              return (
                <Reveal key={p.id} direction="left" delay={i * 100}>
                  {p.link_url ? (
                    <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </Reveal>
              );
            })}
            {partners.length === 0 && <p className="text-foreground/60">Nenhum parceiro cadastrado ainda.</p>}
          </div>
        </Section>
      </>
    );
  }

  // 1) Segmento
  const segment = await getSegment(slug);
  if (segment) {
    return (
      <>
        <PageHero title={segment.title} image={segment.hero_image} subtitle={segment.age_range || undefined} />
        <Section className="max-w-4xl">
          {segment.intro && <p className="text-lg text-foreground/80 mb-8">{segment.intro}</p>}

          {Array.isArray(segment.schedule) && segment.schedule.length > 0 && (
            <div className="mb-10 grid gap-4 sm:grid-cols-2">
              {(segment.schedule as { label: string; from: string; to: string }[]).map((h, i) => (
                <div key={i} className="rounded-2xl border border-brand-soft p-5">
                  <p className="text-sm font-bold uppercase text-accent-ink">{h.label}</p>
                  <p className="text-xl font-extrabold text-brand-dark">{h.from} – {h.to}</p>
                </div>
              ))}
            </div>
          )}

          <RichBody content={segment.body} />
          <VisitCTA title={segment.title} />
        </Section>
      </>
    );
  }

  // 2) Atividade
  const activity = await getActivity(slug);
  if (activity) {
    return (
      <>
        <PageHero title={activity.title} image={activity.hero_image} />
        <Section className="max-w-4xl">
          <RichBody content={activity.body} />
          <p className="mt-8">
            <Link href={`/${activity.category}`} className="font-bold text-brand hover:underline">
              ← Ver todas as atividades {activity.category === "curricular" ? "curriculares" : "extracurriculares"}
            </Link>
          </p>
          <VisitCTA title={activity.title} />
        </Section>
      </>
    );
  }

  // 3) Página institucional / legal / listagem
  const page = getPage(slug);
  if (page) {
    return (
      <>
        <PageHero title={page.title} image={page.hero_image} />
        <Section className="max-w-4xl">
          <Prose paragraphs={page.paragraphs} />
          {page.gallery.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {page.gallery.map((src, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={src} alt={`${page.title} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </Section>
      </>
    );
  }

  notFound();
}
