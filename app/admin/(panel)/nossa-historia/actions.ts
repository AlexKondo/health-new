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
