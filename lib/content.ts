/**
 * Camada de acesso a conteúdo. Lê do Supabase quando configurado; caso
 * contrário (preview local sem credenciais) cai para os JSON de seed
 * empacotados em content/seed. Server-only.
 */
import { createClient } from "@/lib/supabase/server";

import testimonialsSeed from "@/content/seed/testimonials.json";
import faqSeed from "@/content/seed/faq.json";
import segmentsSeed from "@/content/seed/segments.json";
import activitiesSeed from "@/content/seed/activities.json";
import bannersSeed from "@/content/seed/banners.json";
import partnersSeed from "@/content/seed/partners.json";
import pagesSeed from "@/content/seed/pages.json";
import statsSeed from "@/content/seed/stats.json";

export type Testimonial = (typeof testimonialsSeed)[number];
export type Faq = (typeof faqSeed)[number];
export type Segment = (typeof segmentsSeed)[number] & {
  show_carousel?: boolean;
  carousel_interval_seconds?: number;
};
export type Activity = (typeof activitiesSeed)[number] & {
  show_carousel?: boolean;
  carousel_interval_seconds?: number;
};
export type Banner = (typeof bannersSeed)[number];
export type Stat = (typeof statsSeed)[number];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseEnabled = !!url && !url.includes("YOUR_PROJECT");

async function fromSupabase<T>(
  run: (sb: Awaited<ReturnType<typeof createClient>>) => PromiseLike<{ data: T[] | null; error: unknown }>,
  fallback: T[],
): Promise<T[]> {
  if (!supabaseEnabled) return fallback;
  try {
    const sb = await createClient();
    const { data, error } = await run(sb);
    if (error || !data || data.length === 0) return fallback;
    return data;
  } catch {
    return fallback;
  }
}

export const getTestimonials = () =>
  fromSupabase<Testimonial>(
    (sb) => sb.from("testimonials").select("*").eq("published", true).order("sort_order"),
    testimonialsSeed,
  );

export const getFaq = () =>
  fromSupabase<Faq>(
    (sb) => sb.from("faq").select("*").eq("published", true).order("sort_order"),
    faqSeed,
  );

export const getSegments = () =>
  fromSupabase<Segment>(
    (sb) => sb.from("segments").select("*").eq("published", true).order("sort_order"),
    segmentsSeed,
  );

export const getActivities = () =>
  fromSupabase<Activity>((sb) => sb.from("activities").select("*").order("sort_order"), activitiesSeed);

export const getActiveBanners = () =>
  fromSupabase<Banner>((sb) => sb.from("active_banners").select("*"), bannersSeed);

export const getStats = () =>
  fromSupabase<Stat>((sb) => sb.from("stats").select("*").order("sort_order"), statsSeed);

export async function getSetting(key: string, fallback: string): Promise<string> {
  if (!supabaseEnabled) return fallback;
  try {
    const sb = await createClient();
    const { data } = await sb.from("site_settings").select("value").eq("key", key).maybeSingle();
    return data?.value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getSettings(
  defaults: Record<string, string>,
): Promise<Record<string, string>> {
  if (!supabaseEnabled) return defaults;
  try {
    const sb = await createClient();
    const { data } = await sb.from("site_settings").select("key, value").in("key", Object.keys(defaults));
    const out = { ...defaults };
    (data ?? []).forEach((row) => {
      if (row.value) out[row.key] = row.value;
    });
    return out;
  } catch {
    return defaults;
  }
}

const DIFERENCIAIS_DEFAULTS = {
  diferenciais_published: "false",
  diferenciais_title: "Diferenciais",
  diferenciais_hero_image: "/images/Diferenciais-Banner.png",
  diferenciais_body:
    "Turmas com número reduzido de alunos viabilizam a mediação competente do educador. É possível ele conhecer todas as crianças de maneira mais profunda, suas fragilidades, suas potencialidades, incluir a família no processo de aprendizagem, planejar atividades diversificadas, diferenciadas e específicas para cada situação de aprendizagem, proporcionar trocas significativas, o diálogo entre os pares nos mais diferentes contextos e criar oportunidades para que o aluno seja, de fato, protagonista de sua aprendizagem. Neste contexto, todas as crianças serão verdadeiramente acolhidas, ouvidas, vistas e incentivadas a desenvolverem todo o seu potencial. Além disso, as famílias serão parte de todo este processo de aprendizagem.\n\nConhecida também por oferecer uma alimentação saudável e muito gostosa, a Escola Saúde prepara todas as refeições no próprio local com temperos e sucos naturais, matéria-prima de qualidade e com a supervisão de uma nutricionista.\n\nAlém disso, é a própria Tia Ruth, diretora da escola, que “vai para a cozinha” com a sua equipe.\n\nCom comidinhas de vó, o menu é diversificado, balanceado e proporciona às crianças ampliar seu repertório experimentando, por exemplo: salada de quinoa, peixe grelhado, zucchini ao forno, frango à caçadora e comidas orientais (teppan de anchova, yakissoba, missoshiru de tofu, bulgogui, etc).\n\nÉ oferecido nos meses de Janeiro e de Julho a todos os alunos matriculados na Escola Saúde. Para as turmas do Berçário e Grupo 1, este serviço faz parte do calendário e está incluso no valor da anuidade. A partir do Grupo 2, este serviço pode ser contratado à parte pelas famílias que desejarem, podendo ser dias avulsos ou durante todo o mês de férias.\n\nNossa equipe docente é formada por educadores com especializações em: educação infantil, psicomotricidade, alfabetização, alfabetização matemática, contação de histórias, jogos recreativos, etc. Além disso, também dispomos de uma fonoaudióloga, uma psicopedagoga, um neurocientista e duas psicólogas para acompanhar o trabalho, conversar e orientar os alunos e professores, também familiares quando necessário, realizar encaminhamentos e trocar com a equipe de especialistas dos alunos com algum tipo de acompanhamento ou de inclusão.\n\nEducação em seu significado mais amplo. A Escola Saúde é parceira da família na formação de pessoas mais éticas, autônomas, curiosas, empáticas, resilientes, proativas, com pensamento analítico, lógico e, ao mesmo tempo, flexível e criativo. Formar pessoas saudáveis, seguras, com valores, boa autoestima, inspiradas, engajadas, que aprendam a aprender e a ser!\n\nO trabalho realizado diariamente no ambiente escolar, complementa, apoia, enriquece, reforça, cria e amplia as oportunidades de aprendizagem, de desenvolvimento e de vivências das crianças. E é neste processo de aprender a ser, aprender a fazer e aprender a conviver que a Escola Saúde é parceira da Família. Com trocas permanentes, comunicação direta entre coordenação, educadores e responsáveis, relatórios dissertativos e formativos, eventos como o Encontro de Pais, caminhamos e crescemos juntos.\n\nPara que os alunos aproveitem o contraturno na Escola Saúde, oferecemos atividades diversificadas como acompanhamento nos estudos diários, aulas de reforço quando necessário, momentos de jogos e brincadeiras dirigidas, também livres, oficinas com diferentes temas como artesanato, culinária, contação de história, jardinagem e composteira, além das aulas de Robótica, de Japonês e o English Club. Além destas atividades, ainda há a opção de participarem das aulas extracurriculares, nas quais um professor da escola sempre acompanha os alunos, seja para auxiliar na troca do uniforme ou no transporte até o local, também durante a aula e no vestiário.\n\nTodas as aulas de Música, Artes, Tecnologia e Projetos, Japonês, Educação Física, Inglês e do Grupo de Fono são ministradas por professores especialistas, com formação específica na área, inclusive na Educação Infantil. Com atividades lúdicas, significativas e adequadas para cada faixa etária, estas aulas acontecem de uma a quatro vezes por semana, dependendo da grade curricular de cada turma.",
};

export async function getDiferenciais() {
  const s = await getSettings(DIFERENCIAIS_DEFAULTS);
  return {
    published: s.diferenciais_published === "true",
    title: s.diferenciais_title,
    heroImage: s.diferenciais_hero_image,
    body: s.diferenciais_body,
  };
}

const NOSSA_HISTORIA_DEFAULTS = {
  nossa_historia_title: "Nossa História",
  nossa_historia_hero_image: "/images/Nossa-historia-Banner.png",
  nossa_historia_body:
    "Verão de 1993. Duas amigas pedagogas. Conhecidos que trabalhavam e procuravam um lugar confiável onde deixar seus filhos. Igreja Metodista Livre da Saúde. Este foi o contexto do início da nossa trajetória. Começamos atendendo 4 crianças, depois mais 3, logo mais 5 e assim, a Escola cresceu em tamanho, compromisso e responsabilidade.\n\nHoje, contamos com mais de cento e cinquenta alunos mantendo valores e princípios que nos norteiam desde o começo: ambiente cristão, afeto, cooperação, respeito e responsabilidade para com as famílias que se tornam nossas parceiras.\n\nO trabalho pedagógico é diferenciado na qualidade, oferecendo conteúdos e atividades significativas, a fim de garantir um excelente nível de aprendizado e de desenvolvimento integral.\n\nEm abril de 2023 completamos 30 anos de fundação com muitas histórias para contar!",
  nossa_historia_carousel_interval_seconds: "3",
};

export async function getNossaHistoria() {
  const s = await getSettings(NOSSA_HISTORIA_DEFAULTS);
  return {
    title: s.nossa_historia_title,
    heroImage: s.nossa_historia_hero_image,
    body: s.nossa_historia_body,
    carouselIntervalSeconds: Number(s.nossa_historia_carousel_interval_seconds) || 3,
  };
}

export type NossaHistoriaPhoto = { id: string; image_url: string; sort_order: number };

export const getNossaHistoriaPhotos = () =>
  fromSupabase(
    (sb) => sb.from("nossa_historia_photos").select("*").order("sort_order"),
    [] as NossaHistoriaPhoto[],
  );

const INFRA_DEFAULTS = {
  infra_title: "Infraestrutura",
  infra_hero_image: "",
  infra_body:
    "Oferecemos espaço e recursos materiais adequados para desenvolver todas as potencialidades de nossos alunos por meio de um ambiente acolhedor, saudável, lúdico, seguro, que respeita e valoriza a infância.\n\nTodos os espaços, os brinquedos, os jogos, os recursos tecnológicos e acadêmicos são instrumentos para os educadores criarem oportunidades de sociabilização, aprendizagens significativas, construção de conhecimento, desenvolvimento socioemocional e de uma identidade saudável como pessoa e cidadão do mundo.",
  infra_carousel_interval_seconds: "3",
};

export async function getInfraestrutura() {
  const s = await getSettings(INFRA_DEFAULTS);
  return {
    title: s.infra_title,
    heroImage: s.infra_hero_image,
    body: s.infra_body,
    carouselIntervalSeconds: Number(s.infra_carousel_interval_seconds) || 3,
  };
}

export type InfraPhoto = { id: string; image_url: string; sort_order: number };

export const getInfraPhotos = () =>
  fromSupabase(
    (sb) => sb.from("infra_photos").select("*").order("sort_order"),
    [] as InfraPhoto[],
  );

const SOCIAL_DEFAULTS = {
  social_instagram: "",
  social_facebook: "",
  social_youtube: "https://www.youtube.com/@escolasaude",
  contact_phone: "(11) 5072-4470",
  contact_whatsapp_display: "(11) 91943-6104",
  contact_whatsapp_number: "5511919436104",
  contact_address: "Rua Guapiaçu, 151 - Vila Clementino, São Paulo - SP",
};

export async function getSocialLinks() {
  const s = await getSettings(SOCIAL_DEFAULTS);
  return {
    instagram: s.social_instagram,
    facebook: s.social_facebook,
    youtube: s.social_youtube,
    phone: s.contact_phone,
    whatsappDisplay: s.contact_whatsapp_display,
    whatsappNumber: s.contact_whatsapp_number,
    address: s.contact_address,
  };
}

export const getPartners = () =>
  fromSupabase((sb) => sb.from("partners").select("*").order("sort_order"), partnersSeed as never[]);

export async function getSegment(slug: string): Promise<Segment | null> {
  const all = await getSegments();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function getActivity(slug: string): Promise<Activity | null> {
  const all = await getActivities();
  return all.find((a) => a.slug === slug) ?? null;
}

// Páginas institucionais/legais são estáticas (vêm do build de conteúdo).
export type ContentPage = (typeof pagesSeed)[number];
export const getPages = (): ContentPage[] => pagesSeed;

// Páginas com tela de edição própria (ou que são só listagens) ficam fora do
// editor genérico de /admin/paginas.
const OWN_EDITOR_SLUGS = new Set(["nossa-historia", "infraestrutura", "diferenciais", "parceiros", "curricular", "extracurricular"]);
export const getEditablePages = (): ContentPage[] => pagesSeed.filter((p) => !OWN_EDITOR_SLUGS.has(p.slug));

export type PagePhoto = { id: string; image_url: string; sort_order: number };

export const getPagePhotos = (slug: string) =>
  fromSupabase(
    (sb) => sb.from("page_photos").select("*").eq("page_slug", slug).order("sort_order"),
    [] as PagePhoto[],
  );

export type SitePage = {
  slug: string;
  title: string;
  hero_image: string | null;
  body: string | null;
  show_carousel: boolean;
  carousel_interval_seconds: number;
};

export async function getSitePage(slug: string): Promise<SitePage | null> {
  if (!supabaseEnabled) return null;
  try {
    const sb = await createClient();
    const { data } = await sb.from("site_pages").select("*").eq("slug", slug).maybeSingle();
    return (data as SitePage | null) ?? null;
  } catch {
    return null;
  }
}
export const getPage = (slug: string): ContentPage | null =>
  pagesSeed.find((p) => p.slug === slug) ?? null;

/** Todas as páginas do site público, para preencher combos de link (ex: banners). */
export async function getSiteLinkOptions(): Promise<{ href: string; label: string }[]> {
  const [segs, acts] = await Promise.all([getSegments(), getActivities()]);
  const staticPages = [
    { href: "/", label: "Início" },
    { href: "/curricular", label: "Atividades Curriculares" },
    { href: "/extracurricular", label: "Atividades Extracurriculares" },
    { href: "/#depoimentos", label: "Depoimentos" },
    { href: "/faq", label: "Perguntas Frequentes" },
  ];
  const contentPages = getPages()
    .filter((p) => p.slug !== "extracurricular" && p.slug !== "curricular")
    .map((p) => ({ href: `/${p.slug}`, label: p.title }));
  const segmentPages = segs.map((s) => ({ href: `/${s.slug}`, label: s.title }));
  const activityPages = acts.map((a) => ({ href: `/${a.slug}`, label: a.title }));

  // Dedupe por href, mantendo a primeira ocorrência (a ordem acima prioriza
  // as páginas estáticas) — evita duplicidade se algum segmento/atividade
  // antigo no banco tiver o mesmo slug de uma rota já fixa do site.
  const seen = new Set<string>();
  const all = [...staticPages, ...contentPages, ...segmentPages, ...activityPages];
  return all.filter((p) => (seen.has(p.href) ? false : (seen.add(p.href), true)));
}
