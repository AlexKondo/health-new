/**
 * Popula o Supabase a partir de content/seed/*.json e cria os buckets de
 * Storage. Idempotente: tabelas com slug usam upsert; as demais só são
 * semeadas se estiverem vazias (use --force para limpar e resemear).
 *
 * Requer .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 * Run: npm run seed   (ou: npm run seed -- --force)
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });
const force = process.argv.includes("--force");
const SEED = path.resolve(__dirname, "..", "content", "seed");

const read = async (f: string) => JSON.parse(await fs.readFile(path.join(SEED, `${f}.json`), "utf8"));

async function seedTable(table: string, rows: unknown[], opts: { conflict?: string } = {}) {
  if (rows.length === 0) return console.log(`· ${table}: seed vazio, ignorado`);
  if (opts.conflict) {
    const { error } = await sb.from(table).upsert(rows, { onConflict: opts.conflict });
    if (error) return console.error(`✗ ${table}:`, error.message);
    return console.log(`✓ ${table}: ${rows.length} (upsert)`);
  }
  const { count } = await sb.from(table).select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0 && !force) return console.log(`· ${table}: já tem ${count} linhas (use --force)`);
  if (force) await sb.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await sb.from(table).insert(rows);
  if (error) return console.error(`✗ ${table}:`, error.message);
  console.log(`✓ ${table}: ${rows.length} inseridos`);
}

async function ensureBuckets() {
  for (const b of ["banners", "testimonials", "team"]) {
    const { error } = await sb.storage.createBucket(b, { public: true });
    if (error && !/already exists/i.test(error.message)) console.error(`bucket ${b}:`, error.message);
    else console.log(`bucket ${b}: ok`);
  }
}

async function main() {
  await ensureBuckets();
  await seedTable("segments", await read("segments"), { conflict: "slug" });
  await seedTable("activities", await read("activities"), { conflict: "slug" });
  await seedTable("faq", await read("faq"));
  await seedTable("testimonials", await read("testimonials"));
  await seedTable("banners", await read("banners"));
  await seedTable("partners", await read("partners"));
  console.log("\nSeed concluído.");
}

main();
