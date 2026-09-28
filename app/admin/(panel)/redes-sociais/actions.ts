"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

function nullableUrl(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) throw new Error(`Link inválido: "${s}". Comece com https://`);
  return s;
}

function text(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

export async function saveSocialLinks(formData: FormData) {
  const { sb } = await requireUser();

  const whatsappNumber = text(formData.get("whatsapp_number"));
  if (whatsappNumber && !/^\d{10,15}$/.test(whatsappNumber)) {
    throw new Error("Número do WhatsApp inválido — só dígitos, com DDI e DDD (ex.: 5511919436104).");
  }

  const rows = [
    { key: "contact_phone", value: text(formData.get("phone")) },
    { key: "contact_whatsapp_display", value: text(formData.get("whatsapp_display")) },
    { key: "contact_whatsapp_number", value: whatsappNumber },
    { key: "contact_address", value: text(formData.get("address")) },
    { key: "social_instagram", value: nullableUrl(formData.get("instagram")) },
    { key: "social_facebook", value: nullableUrl(formData.get("facebook")) },
    { key: "social_youtube", value: nullableUrl(formData.get("youtube")) },
  ];

  const res = await sb.from("site_settings").upsert(rows);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/redes-sociais");
  revalidatePath("/", "layout");
}
