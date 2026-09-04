"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { uploadPublic } from "@/lib/storage";

const nullable = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s || null;
};

export async function saveTestimonial(formData: FormData) {
  const { sb } = await requireUser();
  const id = nullable(formData.get("id"));

  const file = formData.get("photo") as File | null;
  let photo_url = nullable(formData.get("photo_url"));
  if (file && file.size > 0) photo_url = await uploadPublic("testimonials", file);

  const row = {
    author_name: String(formData.get("author_name") || "").trim(),
    role: String(formData.get("role") || "pai_responsavel"),
    photo_url,
    rating: Number(formData.get("rating") || 5),
    text: String(formData.get("text") || "").trim(),
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const res = id
    ? await sb.from("testimonials").update(row).eq("id", id)
    : await sb.from("testimonials").insert(row);
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/depoimentos");
  revalidatePath("/");
  revalidatePath("/depoimentos");
  redirect("/admin/depoimentos");
}

export async function deleteTestimonial(formData: FormData) {
  const { sb } = await requireUser();
  await sb.from("testimonials").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/depoimentos");
  revalidatePath("/");
}
