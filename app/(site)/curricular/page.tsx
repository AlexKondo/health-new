import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import ActivityTile from "@/components/site/ActivityTile";
import Reveal from "@/components/site/Reveal";
import { getActivities } from "@/lib/content";

export const metadata: Metadata = { title: "Atividades Curriculares" };

export default async function CurricularPage() {
  const activities = (await getActivities()).filter((a) => a.category === "curricular");
  return (
    <>
      <PageHero
        title="Atividades Curriculares"
        image="/images/Curricular-Banner.png"
        subtitle="Atividades integradas ao currículo que ampliam o repertório dos alunos."
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
