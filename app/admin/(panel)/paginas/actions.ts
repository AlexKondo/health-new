"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { uploadPublic } from "@/lib/storage";

function clampInterval(v: FormDataEntryValue | null) {
  return Math.min(30, Math.max(1, Number(v) || 3));
}

export async function savePage(formData: FormData) {
  const { sb } = await requireUser();

  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  if (!slug || !title) throw new Error("Título é obrigatório.");

  let hero_image = String(formData.get("hero_image") || "").trim() || null;
  const file = formData.get("hero_image_file") as File | null;
  if (file && file.size > 0) hero_image = await uploadPublic("pages", file);

  const res = await sb.from("site_pages").upsert(
    {
      slug,
      title,
      hero_image,
      body: String(formData.get("body") || "").trim() || null,
      show_carousel: formData.get("show_carousel") === "on",
      carousel_interval_seconds: clampInterval(formData.get("carousel_interval_seconds")),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );
  if (res.error) throw new Error(res.error.message);

  revalidatePath("/admin/paginas");
  revalidatePath(`/${slug}`);
  redirect(`/admin/paginas/${slug}?saved=1`);
}

export async function addPagePhoto(formData: FormData) {
  const { sb } = await requireUser();

  const slug = String(formData.get("page_slug") || "");
  const returnTo = String(formData.get("return_to") || "/admin/paginas");
  const file = formData.get("photo") as File | null;
  if (!slug) throw new Error("Página inválida.");
  if (!file || file.size === 0) throw new Error("Selecione uma foto.");
  const image_url = await uploadPublic("pages", file);

  const { data: maxRow } = await sb
    .from("page_photos")
    .select("sort_order")
    .eq("page_slug", slug)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const res = await sb.from("page_photos").insert({ page_slug: slug, image_url, sort_order });
  if (res.error) throw new Error(res.error.message);

  revalidatePath(returnTo);
  revalidatePath(`/${slug}`);
  redirect(`${returnTo}?saved=1`);
}

export async function deletePagePhoto(formData: FormData) {
  const { sb } = await requireUser();
  const id = String(formData.get("id"));
  const slug = String(formData.get("page_slug") || "");
  const returnTo = String(formData.get("return_to") || "/admin/paginas");
  await sb.from("page_photos").delete().eq("id", id);
  revalidatePath(returnTo);
  if (slug) revalidatePath(`/${slug}`);
}
