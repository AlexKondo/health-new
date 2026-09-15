"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { uploadPublic } from "@/lib/storage";
import { uniqueSlug } from "@/lib/slug";

function nullable(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || null;
}

function schedule(formData: FormData) {
  const blocks = [] as { label: string; from: string; to: string }[];
  for (const n of [1, 2]) {
    const label = nullable(formData.get(`schedule_${n}_label`));
    const from = nullable(formData.get(`schedule_${n}_from`));
    const to = nullable(formData.get(`schedule_${n}_to`));
    if (label && from && to) blocks.push({ label, from, to });
  }
  return blocks;
}

export async function saveSegment(formData: FormData) {
  const { sb } = await requireUser();

  const id = nullable(formData.get("id"));

  const cardFile = formData.get("card_image_file") as File | null;
  let card_image = nullable(formData.get("card_image"));
  if (cardFile && cardFile.size > 0) card_image = await uploadPublic("segments", cardFile);

  const heroFile = formData.get("hero_image_file") as File | null;
  let hero_image = nullable(formData.get("hero_image"));
  if (heroFile && heroFile.size > 0) hero_image = await uploadPublic("segments", heroFile);

  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Título é obrigatório.");
  const existingSlug = nullable(formData.get("slug"));
  const slug = id && existingSlug ? existingSlug : await uniqueSlug(sb, "segments", title);

  const row = {
    slug,
    title,
    card_image,
    hero_image,
    age_range: nullable(formData.get("age_range")),
    intro: nullable(formData.get("intro")),
    body: nullable(formData.get("body")),
    schedule: schedule(formData),
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const res = id
    ? await sb.from("segments").update(row).eq("id", id)
    : await sb.from("segments").insert(row);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/segmentos");
  revalidatePath("/");
  revalidatePath(`/${row.slug}`);
  redirect("/admin/segmentos");
}

export async function deleteSegment(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  await sb.from("segments").delete().eq("id", id);
  revalidatePath("/admin/segmentos");
  revalidatePath("/");
}
