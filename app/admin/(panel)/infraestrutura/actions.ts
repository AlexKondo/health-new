"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { uploadPublic } from "@/lib/storage";

export async function saveInfraestrutura(formData: FormData) {
  const { sb } = await requireUser();

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title || !body) throw new Error("Título e texto são obrigatórios.");

  const rows: { key: string; value: string }[] = [
    { key: "infra_title", value: title },
    { key: "infra_body", value: body },
  ];

  const intervalRaw = formData.get("carousel_interval_seconds");
  if (intervalRaw !== null) {
    const interval = Math.min(30, Math.max(1, Number(intervalRaw) || 3));
    rows.push({ key: "infra_carousel_interval_seconds", value: String(interval) });
  }

  const file = formData.get("hero_image") as File | null;
  if (file && file.size > 0) {
    const hero_image = await uploadPublic("infraestrutura", file);
    rows.push({ key: "infra_hero_image", value: hero_image });
  }

  const res = await sb.from("site_settings").upsert(rows);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/infraestrutura");
  revalidatePath("/infraestrutura");
  redirect("/admin/infraestrutura?saved=1");
}

export async function addInfraPhoto(formData: FormData) {
  const { sb } = await requireUser();

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) throw new Error("Selecione uma foto.");
  const image_url = await uploadPublic("infraestrutura", file);

  const { data: maxRow } = await sb
    .from("infra_photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const res = await sb.from("infra_photos").insert({ image_url, sort_order });
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/infraestrutura");
  revalidatePath("/infraestrutura");
  redirect("/admin/infraestrutura?saved=1");
}

export async function deleteInfraPhoto(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  await sb.from("infra_photos").delete().eq("id", id);
  revalidatePath("/admin/infraestrutura");
  revalidatePath("/infraestrutura");
}
