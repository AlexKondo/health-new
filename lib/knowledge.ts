import { createServiceClient } from "@/lib/supabase/service";

/**
 * Base de conhecimento do agente, montada a partir do conteúdo do banco
 * (segmentos + FAQ) somada a dados institucionais fixos. É o bloco "estável"
 * do prompt — bom candidato a prompt caching.
 */
export const SCHOOL_FACTS = `
ESCOLA SAÚDE — Educação Infantil e Ensino Fundamental I (Vila Clementino, São Paulo).
Fundada em 1993, ambiente de valores cristãos (afeto, cooperação, respeito e responsabilidade).
Endereço: Rua Guapiaçu, 151 - Vila Clementino, São Paulo - SP.
Telefone: (11) 5072-4470 | WhatsApp: (11) 91943-6104.
E-mail: escolasaude@escolasaude.com.br.
Horário de funcionamento: segunda a sexta, das 7h às 19h.
Segmentos: Berçário e Grupo 1, Educação Infantil, Ensino Fundamental I.
Atividades extracurriculares: ballet, judô, natação, futebol, tênis de mesa, violão,
piano, teatro, musicalização, inglês, japonês, robótica, entre outras.
`.trim();

export async function buildKnowledgeBase(): Promise<string> {
  const sb = createServiceClient();
  const [{ data: faq }, { data: segments }] = await Promise.all([
    sb.from("faq").select("question, answer").eq("published", true).order("sort_order"),
    sb.from("segments").select("title, age_range, intro, schedule").order("sort_order"),
  ]);

  const faqBlock = (faq ?? [])
    .map((f) => `P: ${f.question}\nR: ${f.answer}`)
    .join("\n\n");

  const segBlock = (segments ?? [])
    .map((s) => {
      const horarios = Array.isArray(s.schedule)
        ? (s.schedule as { label?: string; from?: string; to?: string }[])
            .map((h) => `${h.label ?? ""} ${h.from ?? ""}–${h.to ?? ""}`.trim())
            .join("; ")
        : "";
      return `${s.title}${s.age_range ? ` (${s.age_range})` : ""}: ${s.intro ?? ""}${
        horarios ? `\nHorários: ${horarios}` : ""
      }`;
    })
    .join("\n\n");

  return [
    SCHOOL_FACTS,
    segBlock && `SEGMENTOS\n${segBlock}`,
    faqBlock && `PERGUNTAS FREQUENTES\n${faqBlock}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
