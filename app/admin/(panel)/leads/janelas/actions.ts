"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

export async function saveWindow(formData: FormData) {
  const { sb } = await requireUser();

  const weekday = Number(formData.get("weekday"));
  const start_time = String(formData.get("start_time") || "");
  const end_time = String(formData.get("end_time") || "");
  const slot_minutes = Number(formData.get("slot_minutes") || 60);
  const capacity = Number(formData.get("capacity") || 1);

  if (!start_time || !end_time) throw new Error("Horário inicial e final são obrigatórios.");
  if (end_time <= start_time) throw new Error("Horário final precisa ser depois do inicial.");

  const { error } = await sb.from("visit_windows").insert({
    weekday,
    start_time,
    end_time,
    slot_minutes,
    capacity,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/leads/janelas");
}

export async function toggleWindow(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await sb.from("visit_windows").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/leads/janelas");
}

export async function deleteWindow(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  await sb.from("visit_windows").delete().eq("id", id);
  revalidatePath("/admin/leads/janelas");
}
