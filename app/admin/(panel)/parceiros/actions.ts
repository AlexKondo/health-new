"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { uploadSquareLogo } from "@/lib/storage";

function nullable(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || null;
}

export async function savePartner(formData: FormData) {
  const { sb } = await requireUser();

  const id = nullable(formData.get("id"));
  const file = formData.get("logo") as File | null;
  let logo_url = nullable(formData.get("logo_url"));
  if (file && file.size > 0) logo_url = await uploadSquareLogo("partners", file, 400);

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Nome é obrigatório.");

  const row = {
    name,
    logo_url,
    link_url: nullable(formData.get("link_url")),
    description: nullable(formData.get("description")),
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const res = id
    ? await sb.from("partners").update(row).eq("id", id)
    : await sb.from("partners").insert(row);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/parceiros");
  revalidatePath("/parceiros");
  redirect("/admin/parceiros?saved=1");
}

export async function deletePartner(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  await sb.from("partners").delete().eq("id", id);
  revalidatePath("/admin/parceiros");
  revalidatePath("/parceiros");
}
