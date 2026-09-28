"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

function nullableUrl(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) throw new Error(`Link inválido: "${s}". Comece com https://`);
  return s;
}

export async function saveSocialLinks(formData: FormData) {
  const { sb } = await requireUser();

  const rows = [
    { key: "social_instagram", value: nullableUrl(formData.get("instagram")) },
    { key: "social_facebook", value: nullableUrl(formData.get("facebook")) },
    { key: "social_youtube", value: nullableUrl(formData.get("youtube")) },
  ];

  const res = await sb.from("site_settings").upsert(rows);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/redes-sociais");
  revalidatePath("/");
}
