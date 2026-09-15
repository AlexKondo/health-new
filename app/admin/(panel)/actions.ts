"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

function parsedOverride(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error("Informe um número válido.");
  return String(Math.max(0, Math.round(n)));
}

export async function saveVisitsOverride(formData: FormData) {
  const { sb } = await requireUser();
  const value = formData.get("action") === "clear" ? "" : parsedOverride(formData.get("visits_override"));
  const res = await sb.from("site_settings").upsert({ key: "visits_override", value });
  if (res.error) throw new Error(res.error.message);
  revalidatePath("/admin");
}

export async function saveDurationOverride(formData: FormData) {
  const { sb } = await requireUser();
  let value = "";
  if (formData.get("action") !== "clear") {
    const minutesRaw = Number(formData.get("minutes"));
    const secondsRaw = Number(formData.get("seconds"));
    if (!Number.isFinite(minutesRaw) || !Number.isFinite(secondsRaw)) {
      throw new Error("Informe minutos e segundos válidos.");
    }
    const minutes = Math.max(0, Math.round(minutesRaw));
    const seconds = Math.max(0, Math.min(59, Math.round(secondsRaw)));
    value = String(minutes * 60 + seconds);
  }
  const res = await sb.from("site_settings").upsert({ key: "avg_duration_override_seconds", value });
  if (res.error) throw new Error(res.error.message);
  revalidatePath("/admin");
}
