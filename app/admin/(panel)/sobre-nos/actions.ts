"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { uploadPublic } from "@/lib/storage";

export async function saveAbout(formData: FormData) {
  const { sb } = await requireUser();

  const title = String(formData.get("title") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const cta_text = String(formData.get("cta_text") || "").trim();
  const cta_href = String(formData.get("cta_href") || "").trim() || "#agendar";
  const youtube_url = String(formData.get("youtube_url") || "").trim() || "https://www.youtube.com/@escolasaude";
  if (!title || !text) throw new Error("Título e texto são obrigatórios.");

  const file = formData.get("image") as File | null;
  const thumbFile = formData.get("youtube_thumb") as File | null;
  const rows: { key: string; value: string }[] = [
    { key: "about_title", value: title },
    { key: "about_text", value: text },
    { key: "about_cta_text", value: cta_text },
    { key: "about_cta_href", value: cta_href },
    { key: "about_youtube_url", value: youtube_url },
  ];
  if (file && file.size > 0) {
    const image_url = await uploadPublic("about", file);
    rows.push({ key: "about_image_url", value: image_url });
  }
  if (thumbFile && thumbFile.size > 0) {
    const thumb_url = await uploadPublic("about", thumbFile);
    rows.push({ key: "about_youtube_thumb", value: thumb_url });
  }

  const res = await sb.from("site_settings").upsert(rows);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/sobre-nos");
  revalidatePath("/");
  redirect("/admin/sobre-nos?saved=1");
}
