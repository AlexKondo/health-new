"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

function slugify(v: string) {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function updateStatus(id: string, status: string) {
  const { sb, user } = await requireUser();
  const { data: known } = await sb.from("lead_statuses").select("key").eq("key", status).maybeSingle();
  if (!known) throw new Error("Status inválido.");
  await sb
    .from("leads")
    .update({ status, status_changed_by: user.email, status_changed_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/leads");
}

export async function setScheduledAt(id: string, iso: string | null) {
  const { sb } = await requireUser();
  if (iso !== null && isNaN(new Date(iso).getTime())) throw new Error("Data inválida.");
  await sb.from("leads").update({ scheduled_at: iso }).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function addColumn(rawLabel: string) {
  const { sb } = await requireUser();
  const label = rawLabel.trim();
  if (!label) throw new Error("Nome da coluna é obrigatório.");

  const key = slugify(label);
  if (!key) throw new Error("Nome inválido.");

  const { data: existing } = await sb.from("lead_statuses").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const sort_order = (existing?.sort_order ?? -1) + 1;

  const { data, error } = await sb.from("lead_statuses").insert({ key, label, sort_order }).select().single();
  if (error) throw new Error(error.code === "23505" ? "Já existe uma coluna com esse nome." : error.message);

  revalidatePath("/admin/leads");
  return data;
}

export async function reorderColumns(orderedIds: string[]) {
  const { sb } = await requireUser();
  await Promise.all(orderedIds.map((id, i) => sb.from("lead_statuses").update({ sort_order: i }).eq("id", id)));
  revalidatePath("/admin/leads");
}

export async function updateColumnStyle(id: string, patch: { color?: string; width_px?: number }) {
  const { sb } = await requireUser();
  const update: Record<string, unknown> = {};
  if (patch.color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(patch.color)) throw new Error("Cor inválida.");
    update.color = patch.color;
  }
  if (patch.width_px) {
    update.width_px = Math.min(480, Math.max(160, Math.round(patch.width_px)));
  }
  if (Object.keys(update).length === 0) return;
  await sb.from("lead_statuses").update(update).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function deleteColumn(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));

  const { data: col } = await sb.from("lead_statuses").select("key,is_default").eq("id", id).single();
  if (!col) return;
  if (col.is_default) throw new Error("Essa coluna é padrão do sistema e não pode ser excluída.");

  const { count } = await sb.from("leads").select("*", { count: "exact", head: true }).eq("status", col.key);
  if ((count ?? 0) > 0) throw new Error("Mova os cards dessa coluna antes de excluí-la.");

  await sb.from("lead_statuses").delete().eq("id", id);
  revalidatePath("/admin/leads");
}
