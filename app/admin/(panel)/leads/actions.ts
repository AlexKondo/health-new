"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

const STATUSES = ["novo", "contatado", "agendado", "convertido", "perdido"];

export async function updateStatus(id: string, status: string) {
  if (!STATUSES.includes(status)) throw new Error("Status inválido.");
  const { sb } = await requireUser();
  await sb.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
}
