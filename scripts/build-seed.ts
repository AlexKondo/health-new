/**
 * Compila os dados de seed (content/seed/*.json) a partir do scraping.
 * Estes JSON servem tanto de fallback do site (quando o Supabase não está
 * configurado) quanto de fonte para o seeder do Supabase.
 * Run: npx tsx scripts/build-seed.ts
 */
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const SCRAPED = path.join(ROOT, "scripts", "scraped");
const SEED = path.join(ROOT, "content", "seed");
const IMG = path.join(ROOT, "public", "images");

const readJson = async (f: string) =>
  JSON.parse(await fs.readFile(path.join(SCRAPED, f), "utf8"));

const localImg = (src: string) => "/images/" + path.basename(new URL(src).pathname);
const slugifyName = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");

const BOILERPLATE = [
  "Como educadores", "Ao clicar", "Caso queira saber mais", "Diretora da Escola",
  "CNPJ:", "De segunda a sexta",
];
const isBoilerplate = (p: string) => BOILERPLATE.some((b) => p.startsWith(b));

function firstUploadImage(page: { images: { src: string }[] }): string | null {
  const img = page.images.find((i) => /uploads\/.+\.(png|jpe?g|webp)/i.test(i.src));
  return img ? localImg(img.src) : null;
}

// ---- Depoimentos ----
async function buildTestimonials() {
  const raw: { author_name: string; role: string; relationship: string; text: string }[] =
    JSON.parse(await fs.readFile(path.join(SCRAPED, "testimonials.json"), "utf8"));
  return raw.map((t, i) => {
    const file = `${slugifyName(t.author_name)}.png`;
    return {
      author_name: t.author_name,
      role: t.role,
      photo_url: existsSync(path.join(IMG, file)) ? `/images/${file}` : null,
      rating: 5,
      text: t.text,
      published: true,
      sort_order: i,
    };
  });
}

// ---- FAQ (perguntas curadas + respostas do scrape, na ordem) ----
async function buildFaq() {
  const questions = [
    "Qual é a linha pedagógica utilizada pela escola?",
    "Há atividades fora da sala de aula? Se sim, quais?",
    "Como é formada a equipe do colégio?",
    "De que modo é feita a adaptação de novos alunos?",
    "Como é garantida a segurança dos alunos?",
    "Qual é a política da escola com relação a faltas e atrasos?",
    "Como é o posicionamento da escola em relação ao bullying?",
  ];
  const faq = await readJson("faq.json");
  const answers: string[] = faq.paragraphs.filter((p: string) => p.length > 80 && !isBoilerplate(p));
  return questions.map((q, i) => ({
    question: q,
    answer: answers[i] ?? "",
    sort_order: i,
    published: true,
  }));
}

// ---- Segmentos ----
const SCHEDULES: Record<string, { label: string; from: string; to: string }[]> = {
  bercario: [
    { label: "Manhã", from: "07:30", to: "13:00" },
    { label: "Tarde", from: "13:00", to: "18:30" },
  ],
  "ensino-infantil": [
    { label: "Manhã", from: "07:30", to: "12:00" },
    { label: "Tarde", from: "13:00", to: "17:30" },
  ],
  "ensino-fundamental": [
    { label: "Manhã", from: "07:30", to: "12:30" },
    { label: "Tarde", from: "13:00", to: "18:00" },
  ],
};

async function buildSegments() {
  const defs = [
    { slug: "bercario", title: "Berçário e Grupo 1", age_range: "4 meses a 1 ano" },
    { slug: "ensino-infantil", title: "Educação Infantil", age_range: "Grupos 2 a 5" },
    { slug: "ensino-fundamental", title: "Ensino Fundamental I", age_range: "1º ao 5º ano" },
    { slug: "curricular", title: "Curricular", age_range: "" },
  ];
  const out = [];
  for (let i = 0; i < defs.length; i++) {
    const d = defs[i];
    const page = await readJson(`${d.slug}.json`);
    const paras: string[] = page.paragraphs.filter((p: string) => p.length > 60 && !isBoilerplate(p));
    out.push({
      slug: d.slug,
      title: d.title,
      hero_image: firstUploadImage(page),
      age_range: d.age_range,
      intro: paras[0] ?? "",
      schedule: SCHEDULES[d.slug] ?? [],
      body: paras.join("\n\n"),
      gallery: [],
      sort_order: i,
    });
  }
  return out;
}

// ---- Atividades ----
const ACTIVITIES: { slug: string; title: string; category: "curricular" | "extracurricular" }[] = [
  { slug: "ballet", title: "Ballet", category: "extracurricular" },
  { slug: "judo", title: "Judô", category: "extracurricular" },
  { slug: "natacao", title: "Natação", category: "extracurricular" },
  { slug: "futebol", title: "Futebol", category: "extracurricular" },
  { slug: "tenis-de-mesa", title: "Tênis de Mesa", category: "extracurricular" },
  { slug: "violao", title: "Violão", category: "extracurricular" },
  { slug: "piano-classico", title: "Piano Clássico", category: "extracurricular" },
  { slug: "teatro", title: "Teatro", category: "extracurricular" },
  { slug: "musicalizacao", title: "Musicalização", category: "extracurricular" },
  { slug: "robotica", title: "Robótica", category: "extracurricular" },
  { slug: "japones-ec", title: "Japonês (Extracurricular)", category: "extracurricular" },
  { slug: "english-club", title: "English Club", category: "extracurricular" },
  { slug: "artes", title: "Artes", category: "curricular" },
  { slug: "educacao-fisica", title: "Educação Física", category: "curricular" },
  { slug: "ingles", title: "Inglês", category: "curricular" },
  { slug: "japones", title: "Japonês", category: "curricular" },
  { slug: "gef", title: "Grupo de Educação Física", category: "curricular" },
  { slug: "tecnologia-e-projetos", title: "Tecnologia e Projetos", category: "curricular" },
];

async function buildActivities() {
  const out = [];
  for (let i = 0; i < ACTIVITIES.length; i++) {
    const a = ACTIVITIES[i];
    try {
      const page = await readJson(`${a.slug}.json`);
      const paras: string[] = page.paragraphs.filter((p: string) => p.length > 60 && !isBoilerplate(p));
      out.push({
        slug: a.slug,
        title: a.title,
        category: a.category,
        hero_image: firstUploadImage(page),
        body: paras.join("\n\n"),
        sort_order: i,
      });
    } catch {
      /* página ausente */
    }
  }
  return out;
}

// ---- Banners default (hero da home) ----
async function buildBanners() {
  return [
    {
      title: "Matrículas Abertas",
      image_url: "/images/Matriculas-Abertas-1.png",
      link_url: "/#agendar",
      alt: "Matrículas abertas na Escola Saúde",
      sort_order: 0,
      starts_at: null,
      ends_at: null,
      active: true,
    },
    {
      title: "Escola Saúde",
      image_url: "/images/Escola-Saude-Banners-.png",
      link_url: "/nossa-historia",
      alt: "Bem-vindo à Escola Saúde",
      sort_order: 1,
      starts_at: null,
      ends_at: null,
      active: true,
    },
  ].filter((b) => existsSync(path.join(ROOT, "public", b.image_url.replace(/^\//, ""))));
}

// ---- Páginas institucionais / legais / listagem (conteúdo genérico) ----
const PAGES: { slug: string; title: string }[] = [
  { slug: "missao-visao-e-valores", title: "Missão, Visão e Valores" },
  { slug: "nossa-historia", title: "Nossa História" },
  { slug: "responsabilidade-social", title: "Responsabilidade Social" },
  { slug: "infraestrutura", title: "Infraestrutura" },
  { slug: "diferenciais", title: "Diferenciais" },
  { slug: "periodo-integral", title: "Período Integral" },
  { slug: "extracurricular", title: "Extracurricular" },
  { slug: "curricular", title: "Curricular" },
  { slug: "galeria-de-fotos", title: "Galeria de Fotos" },
  { slug: "podcast", title: "Podcast" },
  { slug: "parceiros", title: "Parceiros" },
  { slug: "politica-de-privacidade", title: "Política de Privacidade" },
  { slug: "termos-de-uso", title: "Termos de Uso" },
];

async function buildPages() {
  const out = [];
  for (const p of PAGES) {
    try {
      const page = await readJson(`${p.slug}.json`);
      const paras: string[] = page.paragraphs.filter(
        (x: string) => x.length > 40 && !isBoilerplate(x),
      );
      const gallery = [
        ...new Set(
          (page.images as { src: string }[])
            .filter((i) => /uploads\/.+\.(png|jpe?g|webp)/i.test(i.src))
            .map((i) => localImg(i.src)),
        ),
      ];
      out.push({
        slug: p.slug,
        title: p.title,
        hero_image: gallery[0] ?? null,
        paragraphs: paras,
        gallery: gallery.slice(1),
      });
    } catch {
      /* ausente */
    }
  }
  return out;
}

async function main() {
  await fs.mkdir(SEED, { recursive: true });
  const data: Record<string, unknown> = {
    testimonials: await buildTestimonials(),
    faq: await buildFaq(),
    segments: await buildSegments(),
    activities: await buildActivities(),
    banners: await buildBanners(),
    pages: await buildPages(),
    partners: [],
  };
  for (const [name, value] of Object.entries(data)) {
    await fs.writeFile(path.join(SEED, `${name}.json`), JSON.stringify(value, null, 2));
    console.log(`${name}: ${(value as unknown[]).length}`);
  }
}

main();
