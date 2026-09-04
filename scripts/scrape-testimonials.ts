/**
 * Extrai os depoimentos (Elementor) de /depoimentos para JSON.
 * O conteúdo está no HTML servidor dentro de divs Elementor; extraímos por
 * regex estrutural (mais robusto que o parser para este layout).
 * Run: npx tsx scripts/scrape-testimonials.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const URL = "https://escolasaude.com.br/depoimentos/";
const OUT = path.resolve(__dirname, "scraped", "testimonials.json");

const clean = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/^"|"$/g, "")
    .trim();

function roleFromRelationship(rel: string): "pai_responsavel" | "ex_aluno" | "colaborador" {
  const t = rel.toLowerCase();
  if (/ex[\s-]?alun/.test(t)) return "ex_aluno";
  if (/pai|m[ãa]e|respons|av[óô]|tia|tio|fam[íi]lia/.test(t)) return "pai_responsavel";
  if (/prof|funcion|colabor|equipe|coorden|diretor|secret|auxiliar|educador|monitor/.test(t))
    return "colaborador";
  return "pai_responsavel";
}

async function main() {
  // O HTML cru é salvo via PowerShell (Invoke-WebRequest) em depoimentos.html,
  // porque o fetch do Node recebe um challenge nesta rota.
  const htmlPath = path.resolve(__dirname, "scraped", "depoimentos.html");
  const html = await fs.readFile(htmlPath, "utf8");
  console.log("HTML length:", html.length);

  // Cada bloco vai de __text até o próximo __text (ou fim). Dentro dele pegamos
  // text / name / title.
  const blocks = html.split('class="elementor-testimonial__text"').slice(1);
  const items: { author_name: string; role: string; relationship: string; text: string }[] = [];
  const seen = new Set<string>();

  for (const b of blocks) {
    const text = clean((b.match(/^[^<]*>([\s\S]*?)<\/div>/) ?? [])[1] ?? b.slice(0, b.indexOf("</div>")));
    // __title traz "Nome, parentesco"
    const title = clean((b.match(/elementor-testimonial__title"[^>]*>([\s\S]*?)<\/(?:div|span)>/) ?? [])[1] ?? "");
    if (!text || !title) continue;
    const [namePart, ...relParts] = title.split(/,/);
    const author_name = clean(namePart);
    const relationship = clean(relParts.join(","));
    if (!author_name) continue;
    const key = author_name + "|" + text.slice(0, 30);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ author_name, role: roleFromRelationship(relationship || title), relationship, text });
  }

  await fs.writeFile(OUT, JSON.stringify(items, null, 2));
  console.log(`${items.length} depoimentos -> ${path.relative(process.cwd(), OUT)}`);
  for (const i of items.slice(0, 6))
    console.log(` - ${i.author_name} [${i.relationship}|${i.role}] :: ${i.text.slice(0, 50)}…`);
}

main();
