import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import ActivityTile from "@/components/site/ActivityTile";
import Reveal from "@/components/site/Reveal";
import { getActivities } from "@/lib/content";

export const metadata: Metadata = { title: "Atividades Extracurriculares" };

export default async function ExtracurricularPage() {
  const activities = (await getActivities()).filter((a) => a.category === "extracurricular");
  return (
    <>
      <PageHero
        title="Atividades Extracurriculares"
        image="/images/Extracurricular-Banner.png"
        subtitle="Esporte, arte e cultura para o desenvolvimento completo de cada criança."
      />
      <Section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {activities.map((a, i) => (
            <Reveal key={a.slug} delay={i * 70}>
              <ActivityTile slug={a.slug} title={a.title} tile_image={(a as { tile_image?: string | null }).tile_image} />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
