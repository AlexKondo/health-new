import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import TestimonialsCarousel from "@/components/site/TestimonialsCarousel";
import { getTestimonials } from "@/lib/content";

export const metadata: Metadata = { title: "Depoimentos" };

export default async function DepoimentosPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHero
        title="Depoimentos"
        image="/images/Escola-Saude-Dep-Banners.png"
        subtitle="O que pais, ex-alunos e colaboradores dizem sobre a Escola Saúde."
      />
      <Section>
        <TestimonialsCarousel items={testimonials} />
      </Section>
    </>
  );
}
