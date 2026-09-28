"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";
import { uploadPublic } from "@/lib/storage";

export async function saveDiferenciais(formData: FormData) {
  const { sb } = await requireUser();

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title || !body) throw new Error("Título e texto são obrigatórios.");
  const published = formData.get("published") === "on";

  const rows: { key: string; value: string }[] = [
    { key: "diferenciais_title", value: title },
    { key: "diferenciais_body", value: body },
    { key: "diferenciais_published", value: String(published) },
  ];

  const file = formData.get("hero_image") as File | null;
  if (file && file.size > 0) {
    const hero_image = await uploadPublic("diferenciais", file);
    rows.push({ key: "diferenciais_hero_image", value: hero_image });
  }

  const res = await sb.from("site_settings").upsert(rows);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/diferenciais");
  revalidatePath("/diferenciais");
}
