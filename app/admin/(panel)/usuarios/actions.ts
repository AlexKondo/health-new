"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendInvite(rawEmail: FormDataEntryValue | null) {
  const email = String(rawEmail || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error("E-mail inválido.");

  const service = createServiceClient();
  const { error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/redefinir-senha`,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/usuarios");
}

export async function inviteUser(formData: FormData) {
  await requireUser();
  await sendInvite(formData.get("email"));
  redirect("/admin/usuarios");
}

export async function resendInvite(formData: FormData) {
  await requireUser();
  await sendInvite(formData.get("email"));
}
