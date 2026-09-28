import sharp from "sharp";
import { createServiceClient } from "@/lib/supabase/service";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_INPUT_BYTES = 3 * 1024 * 1024; // 3MB
const TARGET_MAX_BYTES = 100 * 1024; // 100KB
const MAX_DIMENSION = 1920;
const MIN_WIDTH = 320;

async function compressImage(input: Buffer, maxBytes: number) {
  let base: sharp.Sharp;
  let metadata: sharp.Metadata;
  try {
    base = sharp(input).rotate();
    metadata = await base.metadata();
  } catch {
    throw new Error("Arquivo não é uma imagem válida.");
  }
  if (!metadata.width || !metadata.height) throw new Error("Arquivo não é uma imagem válida.");

  const scale = Math.min(1, MAX_DIMENSION / Math.max(metadata.width, metadata.height));
  let width = Math.round(metadata.width * scale);

  let quality = 80;
  let buffer = await base.clone().resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer();

  while (buffer.length > maxBytes && quality > 35) {
    quality -= 15;
    buffer = await base.clone().resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer();
  }

  while (buffer.length > maxBytes && width > MIN_WIDTH) {
    width = Math.max(MIN_WIDTH, Math.round(width * 0.75));
    buffer = await base.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 40 }).toBuffer();
  }

  return buffer;
}

function validate(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato de imagem não suportado. Envie JPG, PNG, WebP ou GIF.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("A imagem excede o tamanho máximo de 3MB.");
  }
}

async function upload(bucket: string, buffer: Buffer): Promise<string> {
  const service = createServiceClient();
  const path = `${Date.now()}-${Math.round(Math.random() * 1e6)}.webp`;
  const { error } = await service.storage
    .from(bucket)
    .upload(path, buffer, { contentType: "image/webp", upsert: false });
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  return service.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Valida, compacta (alvo ~100KB, WebP) e sobe uma imagem para um bucket
 * público do Supabase Storage, retornando a URL pública. Usar apenas em
 * server actions (após validar o login).
 */
export async function uploadPublic(bucket: string, file: File): Promise<string> {
  validate(file);
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const buffer = await compressImage(inputBuffer, TARGET_MAX_BYTES);
  return upload(bucket, buffer);
}

/**
 * Igual uploadPublic, mas força um canvas quadrado de tamanho fixo (ex.:
 * logos de parceiros) — a imagem enviada é encaixada inteira dentro desse
 * quadrado (sem cortar nem distorcer) e o espaço sobrando fica transparente.
 * Assim toda logo sai com o mesmo tamanho de arquivo, não importa o
 * tamanho/proporção do que a pessoa mandou.
 */
export async function uploadSquareLogo(bucket: string, file: File, size = 400): Promise<string> {
  validate(file);
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let base: sharp.Sharp;
  let metadata: sharp.Metadata;
  try {
    base = sharp(inputBuffer).rotate();
    metadata = await base.metadata();
  } catch {
    throw new Error("Arquivo não é uma imagem válida.");
  }
  if (!metadata.width || !metadata.height) throw new Error("Arquivo não é uma imagem válida.");

  let quality = 85;
  let buffer = await base
    .clone()
    .resize({ width: size, height: size, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality })
    .toBuffer();

  while (buffer.length > TARGET_MAX_BYTES && quality > 35) {
    quality -= 15;
    buffer = await base
      .clone()
      .resize({ width: size, height: size, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality })
      .toBuffer();
  }

  return upload(bucket, buffer);
}
