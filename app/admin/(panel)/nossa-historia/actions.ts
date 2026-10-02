"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { uploadPublic } from "@/lib/storage";

export async function saveNossaHistoria(formData: FormData) {
  const { sb } = await requireUser();

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title || !body) throw new Error("Título e texto são obrigatórios.");

  const rows: { key: string; value: string }[] = [
    { key: "nossa_historia_title", value: title },
    { key: "nossa_historia_body", value: body },
  ];

  const intervalRaw = formData.get("carousel_interval_seconds");
  if (intervalRaw !== null) {
    const interval = Math.min(30, Math.max(1, Number(intervalRaw) || 3));
    rows.push({ key: "nossa_historia_carousel_interval_seconds", value: String(interval) });
  }

  const file = formData.get("hero_image") as File | null;
  if (file && file.size > 0) {
    const hero_image = await uploadPublic("nossa-historia", file);
    rows.push({ key: "nossa_historia_hero_image", value: hero_image });
  }

  const res = await sb.from("site_settings").upsert(rows);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/nossa-historia");
  revalidatePath("/nossa-historia");
  redirect("/admin/nossa-historia?saved=1");
}

export async function addNossaHistoriaPhoto(formData: FormData) {
  const { sb } = await requireUser();

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) throw new Error("Selecione uma foto.");
  const image_url = await uploadPublic("nossa-historia", file);

  const { data: maxRow } = await sb
    .from("nossa_historia_photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const res = await sb.from("nossa_historia_photos").insert({ image_url, sort_order });
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/nossa-historia");
  revalidatePath("/nossa-historia");
  redirect("/admin/nossa-historia?saved=1");
}

export async function deleteNossaHistoriaPhoto(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  await sb.from("nossa_historia_photos").delete().eq("id", id);
  revalidatePath("/admin/nossa-historia");
  revalidatePath("/nossa-historia");
}
