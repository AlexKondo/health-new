import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/site/Hero";
import StatsStrip from "@/components/site/StatsStrip";
import TestimonialsCarousel from "@/components/site/TestimonialsCarousel";
import FaqAccordion from "@/components/site/FaqAccordion";
import LeadForm from "@/components/site/LeadForm";
import ActivityTile from "@/components/site/ActivityTile";
import Reveal from "@/components/site/Reveal";
import { Section, SectionTitle } from "@/components/site/Section";
import {
  getActiveBanners, getTestimonials, getFaq, getSegments, getActivities, getStats, getSetting,
} from "@/lib/content";

const SEGMENT_BLURB: Record<string, string> = {
  bercario: "Acolhimento e estímulo nos primeiros passos, com muito afeto.",
  "ensino-infantil": "Curiosidade, autonomia e o encanto de aprender brincando.",
  "ensino-fundamental": "Base sólida para a vida: leitura, lógica e valores.",
};

export default async function HomePage() {
  const [banners, testimonials, faq, segments, activities, stats, testimonialsIntervalRaw] = await Promise.all([
    getActiveBanners(), getTestimonials(), getFaq(), getSegments(), getActivities(), getStats(),
    getSetting("testimonials_interval_seconds", "6"),
  ]);
  const testimonialsInterval = Number(testimonialsIntervalRaw) || 0;

  const mainSegments = segments.filter((s) => s.slug !== "curricular");
  const extracurriculares = activities.filter((a) => a.category === "extracurricular").slice(0, 8);

  return (
    <>
      <Hero banners={banners} />
      <StatsStrip stats={stats} />

      {/* Sobre nós */}
      <Section className="relative grid items-center gap-12 md:grid-cols-2 overflow-hidden">
        <span className="pointer-events-none absolute -left-24 -top-10 -z-10 h-72 w-72 rounded-full bg-brand-soft blur-3xl opacity-70 animate-blob" />
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-wide text-accent-ink">Desde 1993</p>
          <h2 className="mt-1 text-3xl md:text-4xl font-extrabold">
            Um lugar de <span className="text-gradient">afeto e aprendizado</span>
          </h2>
          <p className="mt-4 text-foreground/75 leading-relaxed">
            A Escola Saúde nasceu em 1993 com a missão de educar com afeto, cooperação, respeito e
            responsabilidade. Em um ambiente acolhedor e familiar na Vila Clementino, oferecemos
            Educação Infantil e Ensino Fundamental I com ensino de qualidade e cuidado individual
            com cada criança.
          </p>
          <Link
            href="/nossa-historia"
            className="group mt-6 inline-flex items-center gap-2 rounded-full border-2 border-brand px-5 py-2.5 font-bold text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Conheça nossa história
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
        <Reveal delay={150}>
          <Link
            href="https://www.youtube.com/@escolasaude"
            target="_blank"
            className="relative block aspect-video overflow-hidden rounded-3xl shadow-xl group"
          >
            <Image
              src="/images/Thumbnail-Youtube_Institucional.png"
              alt="Vídeo institucional da Escola Saúde"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/10">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-white/90 text-3xl text-brand shadow-lg transition-transform group-hover:scale-110">
                ▶
              </span>
              <span className="absolute h-20 w-20 rounded-full ring-4 ring-white/50 animate-ping" />
            </span>
          </Link>
        </Reveal>
      </Section>

      {/* Segmentos */}
      <div className="relative bg-brand-soft/50">
        <Section>
          <Reveal><SectionTitle eyebrow="Formação" title="Nossos segmentos" center /></Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {mainSegments.map((s, i) => (
              <Reveal key={s.slug} delay={i * 120}>
                <Link
                  href={`/${s.slug}`}
                  className="group block h-full overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  {(s.card_image ?? s.hero_image) && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={(s.card_image ?? s.hero_image)!}
                        alt={s.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-extrabold text-brand-dark">{s.title}</h3>
                    <p className="mt-2 text-sm text-foreground/70">
                      {SEGMENT_BLURB[s.slug] ?? s.intro?.slice(0, 110)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 font-bold text-brand">
                      Saiba mais
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      {/* Extracurriculares */}
      {extracurriculares.length > 0 && (
        <Section>
          <Reveal><SectionTitle eyebrow="Complementar" title="Atividades extracurriculares" center /></Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {extracurriculares.map((a, i) => (
              <Reveal key={a.slug} delay={i * 80}>
                <ActivityTile slug={a.slug} title={a.title} tile_image={(a as { tile_image?: string | null }).tile_image} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/extracurricular"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-transform hover:scale-105"
            >
              Ver todas as atividades →
            </Link>
          </div>
        </Section>
      )}

      {/* Depoimentos */}
      <div className="bg-brand-soft/50">
        <Section>
          <Reveal><SectionTitle eyebrow="Depoimentos" title="O que as famílias dizem" center /></Reveal>
          <Reveal delay={120}><TestimonialsCarousel items={testimonials} intervalSeconds={testimonialsInterval} /></Reveal>
        </Section>
      </div>

      {/* FAQ */}
      <Section className="max-w-3xl">
        <Reveal><SectionTitle eyebrow="Dúvidas" title="Perguntas frequentes" center /></Reveal>
        <Reveal delay={120}><FaqAccordion items={faq} /></Reveal>
      </Section>

      {/* Agendar */}
      <div id="agendar" className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark text-white scroll-mt-24">
        <span className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl animate-float" />
        <Section className="grid gap-10 md:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-wide text-accent-ink">Venha conhecer</p>
            <h2 className="mt-1 text-3xl md:text-4xl font-extrabold">Agende uma visita</h2>
            <p className="mt-4 text-white/85 leading-relaxed">
              Nada como conhecer a escola de perto. Preencha o formulário e nossa equipe entrará em
              contato para marcar sua visita e tirar todas as suas dúvidas.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="rounded-3xl bg-white p-6 text-foreground shadow-2xl">
              <LeadForm />
            </div>
          </Reveal>
        </Section>
      </div>
    </>
  );
}
