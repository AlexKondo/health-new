"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

const META_PIXEL_RE = /^\d{6,20}$/;
const GOOGLE_TAG_RE = /^(G|AW|GT)-[A-Z0-9]{4,20}$/i;

export async function saveTrafficSettings(formData: FormData) {
  const { sb } = await requireUser();
  const meta_pixel_id = String(formData.get("meta_pixel_id") || "").trim();
  const google_tag_id = String(formData.get("google_tag_id") || "").trim();

  if (meta_pixel_id && !META_PIXEL_RE.test(meta_pixel_id)) {
    throw new Error("Meta Pixel ID inválido — deve conter apenas números.");
  }
  if (google_tag_id && !GOOGLE_TAG_RE.test(google_tag_id)) {
    throw new Error("Google Tag ID inválido — formato esperado: G-XXXXXXX ou AW-XXXXXXXXX.");
  }

  const res = await sb.from("site_settings").upsert([
    { key: "meta_pixel_id", value: meta_pixel_id },
    { key: "google_tag_id", value: google_tag_id },
  ]);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/trafego");
  revalidatePath("/");
}
