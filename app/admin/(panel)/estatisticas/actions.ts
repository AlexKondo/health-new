"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";

function nullable(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || null;
}

export async function saveStat(formData: FormData) {
  const { sb } = await requireUser();

  const id = nullable(formData.get("id"));
  const row = {
    value: Number(formData.get("value") || 0),
    suffix: String(formData.get("suffix") || "").trim(),
    label: String(formData.get("label") || "").trim(),
    sort_order: Number(formData.get("sort_order") || 0),
  };
  if (!row.label) throw new Error("Rótulo é obrigatório.");

  const res = id
    ? await sb.from("stats").update(row).eq("id", id)
    : await sb.from("stats").insert(row);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/estatisticas");
  revalidatePath("/");
  redirect("/admin/estatisticas");
}

export async function deleteStat(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  await sb.from("stats").delete().eq("id", id);
  revalidatePath("/admin/estatisticas");
  revalidatePath("/");
}
