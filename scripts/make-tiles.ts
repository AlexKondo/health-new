/**
 * Gera tiles quadrados (recorte centralizado) das fotos limpas de atividades e
 * segmentos usando sharp, e atualiza content/seed com o campo tile_image.
 * Atividades sem foto limpa ficam com tile_image=null (a UI mostra um tile com
 * gradiente + ícone).
 * Run: npx tsx scripts/make-tiles.ts
 */
import sharp from "sharp";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const IMG = path.join(ROOT, "public", "images");
const SQ = path.join(IMG, "sq");
const SEED = path.join(ROOT, "content", "seed");

// slug da atividade -> arquivo de foto limpa (sem texto) em public/images
const ACTIVITY_PHOTO: Record<string, string> = {
  ballet: "Ballet.png",
  futebol: "Futsal.png",
  natacao: "Natacao.png",
  "tenis-de-mesa": "Tenis-de-Mesa.png",
  violao: "Violao.png",
  musicalizacao: "Musicalizacao.png",
  artes: "artes-2-1.png",
};

// segmentos -> foto limpa para card 16:9
const SEGMENT_PHOTO: Record<string, string> = {
  bercario: "Bercario-1.png",
  "ensino-infantil": "Grupo-4-e-5-3.png",
};

async function square(srcFile: string, outName: string, size = 700) {
  const src = path.join(IMG, srcFile);
  if (!existsSync(src)) return false;
  await sharp(src)
    .resize(size, size, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(SQ, outName));
  return true;
}

async function wide(srcFile: string, outName: string) {
  const src = path.join(IMG, srcFile);
  if (!existsSync(src)) return false;
  await sharp(src)
    .resize(1280, 720, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(SQ, outName));
  return true;
}

async function main() {
  await fs.mkdir(SQ, { recursive: true });

  // Atividades
  const actPath = path.join(SEED, "activities.json");
  const activities = JSON.parse(await fs.readFile(actPath, "utf8"));
  for (const a of activities) {
    const photo = ACTIVITY_PHOTO[a.slug];
    if (photo && (await square(photo, `${a.slug}.jpg`))) {
      a.tile_image = `/images/sq/${a.slug}.jpg`;
    } else {
      a.tile_image = null;
    }
  }
  await fs.writeFile(actPath, JSON.stringify(activities, null, 2));
  console.log(`Atividades com tile: ${activities.filter((a: { tile_image: string | null }) => a.tile_image).length}/${activities.length}`);

  // Segmentos (card 16:9 com foto limpa quando houver)
  const segPath = path.join(SEED, "segments.json");
  const segments = JSON.parse(await fs.readFile(segPath, "utf8"));
  for (const s of segments) {
    const photo = SEGMENT_PHOTO[s.slug];
    if (photo && (await wide(photo, `seg-${s.slug}.jpg`))) {
      s.card_image = `/images/sq/seg-${s.slug}.jpg`;
    } else {
      s.card_image = s.hero_image;
    }
  }
  await fs.writeFile(segPath, JSON.stringify(segments, null, 2));
  console.log("Segmentos atualizados.");
}

main();
