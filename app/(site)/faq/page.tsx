import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import FaqAccordion from "@/components/site/FaqAccordion";
import { getFaq } from "@/lib/content";

export const metadata: Metadata = { title: "Perguntas Frequentes" };

export default async function FaqPage() {
  const faq = await getFaq();
  return (
    <>
      <PageHero title="Perguntas Frequentes" image="/images/FAQ.png" />
      <Section className="max-w-3xl">
        <FaqAccordion items={faq} />
      </Section>
    </>
  );
}
