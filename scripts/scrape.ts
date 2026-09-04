/**
 * Scrape escolasaude.com.br (WordPress) — recovers media + extracts content.
 *
 *  - Visits every URL in PAGES (from the Yoast sitemap).
 *  - Extracts title / headings / paragraphs / list items / images per page
 *    into scripts/scraped/<slug>.json (+ _index.json).
 *  - Collects every wp-content/uploads image, normalizes it to the ORIGINAL
 *    (strips the WordPress -WIDTHxHEIGHT suffix) and downloads it to
 *    public/images, falling back to the largest variant if the original 404s.
 *
 * Run: npm run scrape
 */
import * as cheerio from "cheerio";
import { promises as fs } from "node:fs";
import path from "node:path";

const BASE = "https://escolasaude.com.br";
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "scripts", "scraped");
const IMG_DIR = path.join(ROOT, "public", "images");

const PAGES = [
  "/", "/missao-visao-e-valores/", "/nossa-historia/", "/responsabilidade-social/",
  "/infraestrutura/", "/diferenciais/", "/parceiros/", "/depoimentos/", "/faq/",
  "/galeria-de-fotos/", "/podcast/", "/30-anos/",
  // Formação
  "/bercario/", "/ensino-infantil/", "/ensino-fundamental/", "/curricular/",
  // Complementar
  "/periodo-integral/", "/extracurricular/",
  // Atividades (curriculares + extracurriculares)
  "/artes/", "/ballet/", "/educacao-fisica/", "/english-club/", "/futebol/",
  "/gef/", "/ingles/", "/japones/", "/japones-ec/", "/judo/", "/musicalizacao/",
  "/natacao/", "/piano-classico/", "/robotica/", "/tecnologia-e-projetos/",
  "/teatro/", "/tenis-de-mesa/", "/violao/",
  // Conteúdo / institucional extra
  "/aldeia-das-experiencias/", "/educacao-cientifica-para-o-seculo-xxi/",
  "/escola-saude-noticias-e-artigos/", "/ficar-mais-inteligente/",
  "/festa-caipira/",
  // Legais / formulários
  "/politica-de-privacidade/", "/termos-de-uso/", "/inscricao-palestra/",
];

type Page = {
  url: string;
  slug: string;
  title: string;
  h1: string[];
  headings: { tag: string; text: string }[];
  paragraphs: string[];
  listItems: string[];
  images: { src: string; alt: string }[];
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const slugify = (p: string) => (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "-"));

/** Strip the WordPress -WxH thumbnail suffix to get the original upload URL. */
function toOriginal(u: string): string {
  return u.replace(/-\d+x\d+(?=\.\w+(?:$|\?))/, "");
}
function area(u: string): number {
  const m = u.match(/-(\d+)x(\d+)(?=\.\w+)/);
  return m ? Number(m[1]) * Number(m[2]) : Number.MAX_SAFE_INTEGER;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (scrape)" } });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(IMG_DIR, { recursive: true });

  const pages: Page[] = [];
  // original URL -> { variants seen }   (to recover full-res media)
  const media = new Map<string, Set<string>>();

  for (const p of PAGES) {
    const url = BASE + p;
    const html = await fetchText(url);
    if (!html) {
      console.warn("FALHOU:", url);
      continue;
    }
    // Robust media recovery: scan the RAW html for every uploads URL, including
    // lazy-load attributes (data-src/srcset) and Elementor JSON blobs.
    const uploadRe = /https?:\/\/escolasaude\.com\.br\/wp-content\/uploads\/[^\s"'()\\<>]+?\.(?:png|jpe?g|webp|gif)/gi;
    for (const raw of html.match(uploadRe) ?? []) {
      const src = raw.replace(/\\\//g, "/");
      const orig = toOriginal(src);
      if (!media.has(orig)) media.set(orig, new Set());
      media.get(orig)!.add(src);
    }

    const $ = cheerio.load(html);
    $("script, style, noscript, svg").remove();

    const headings: Page["headings"] = [];
    $("h1, h2, h3, h4").each((_, el) => {
      const text = clean($(el).text());
      if (text) headings.push({ tag: (el as cheerio.TagElement).tagName.toLowerCase(), text });
    });

    const paragraphs: string[] = [];
    $("p").each((_, el) => {
      const t = clean($(el).text());
      if (t && t.length > 1) paragraphs.push(t);
    });

    const listItems: string[] = [];
    $("li").each((_, el) => {
      const t = clean($(el).text());
      if (t && t.length > 1 && t.length < 400) listItems.push(t);
    });

    const images: Page["images"] = [];
    $("img").each((_, el) => {
      let src = $(el).attr("src") || $(el).attr("data-src") || "";
      if (!src) return;
      if (src.startsWith("/")) src = BASE + src;
      const alt = clean($(el).attr("alt") || "");
      images.push({ src, alt });
      if (/wp-content\/uploads\/.+\.(png|jpe?g|webp|gif|svg)/i.test(src)) {
        const orig = toOriginal(src);
        if (!media.has(orig)) media.set(orig, new Set());
        media.get(orig)!.add(src);
      }
    });

    const page: Page = {
      url,
      slug: slugify(p),
      title: clean($("title").first().text()),
      h1: $("h1").map((_, el) => clean($(el).text())).get().filter(Boolean),
      headings,
      paragraphs: [...new Set(paragraphs)],
      listItems: [...new Set(listItems)],
      images,
    };
    pages.push(page);
    await fs.writeFile(path.join(OUT_DIR, `${page.slug}.json`), JSON.stringify(page, null, 2));
    console.log(`OK ${page.slug}  (${paragraphs.length}p, ${images.length}img)`);
  }

  await fs.writeFile(
    path.join(OUT_DIR, "_index.json"),
    JSON.stringify(pages.map((p) => ({ slug: p.slug, url: p.url, title: p.title })), null, 2),
  );

  // ---- download media (originals, with largest-variant fallback) ----
  let saved = 0;
  for (const [orig, variants] of media) {
    const file = path.basename(new URL(orig).pathname);
    const dest = path.join(IMG_DIR, file);
    try {
      let res = await fetch(orig);
      if (!res.ok) {
        // original missing (e.g. logo) -> grab the largest known variant
        const largest = [...variants].sort((a, b) => area(b) - area(a))[0];
        res = await fetch(largest);
        if (!res.ok) continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(dest, buf);
      saved++;
    } catch {
      /* skip */
    }
  }

  console.log(`\n${pages.length} páginas, ${media.size} imagens originais, ${saved} baixadas.`);
}

main();
