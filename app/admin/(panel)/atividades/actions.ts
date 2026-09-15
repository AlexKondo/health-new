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

export async function saveActivity(formData: FormData) {
  const { sb } = await requireUser();

  const id = nullable(formData.get("id"));

  const tileFile = formData.get("tile_image_file") as File | null;
  let tile_image = nullable(formData.get("tile_image"));
  if (tileFile && tileFile.size > 0) tile_image = await uploadPublic("activities", tileFile);

  const heroFile = formData.get("hero_image_file") as File | null;
  let hero_image = nullable(formData.get("hero_image"));
  if (heroFile && heroFile.size > 0) hero_image = await uploadPublic("activities", heroFile);

  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Título é obrigatório.");
  const existingSlug = nullable(formData.get("slug"));
  const slug = id && existingSlug ? existingSlug : await uniqueSlug(sb, "activities", title);

  const category = String(formData.get("category") || "extracurricular");
  const row = {
    slug,
    title,
    category: category === "curricular" ? "curricular" : "extracurricular",
    tile_image,
    hero_image,
    body: nullable(formData.get("body")),
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const res = id
    ? await sb.from("activities").update(row).eq("id", id)
    : await sb.from("activities").insert(row);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/atividades");
  revalidatePath("/");
  revalidatePath(`/${row.slug}`);
  redirect("/admin/atividades");
}

export async function deleteActivity(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  await sb.from("activities").delete().eq("id", id);
  revalidatePath("/admin/atividades");
  revalidatePath("/");
}
