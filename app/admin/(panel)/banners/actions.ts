"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { uploadPublic } from "@/lib/storage";

function nullable(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || null;
}

export async function saveBanner(formData: FormData) {
  const { sb } = await requireUser();

  const id = nullable(formData.get("id"));
  const file = formData.get("image") as File | null;
  let image_url = nullable(formData.get("image_url"));
  if (file && file.size > 0) {
    image_url = await uploadPublic("banners", file);
  }
  if (!image_url) throw new Error("Imagem é obrigatória.");

  const row = {
    title: String(formData.get("title") || "").trim(),
    image_url,
    link_url: nullable(formData.get("link_url")),
    alt: nullable(formData.get("alt")),
    sort_order: Number(formData.get("sort_order") || 0),
    starts_at: nullable(formData.get("starts_at")),
    ends_at: nullable(formData.get("ends_at")),
    active: formData.get("active") === "on",
  };

  const res = id
    ? await sb.from("banners").update(row).eq("id", id)
    : await sb.from("banners").insert(row);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function deleteBanner(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  await sb.from("banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function toggleBanner(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await sb.from("banners").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
