import { createServiceClient } from "@/lib/supabase/service";

/**
 * Faz upload de um arquivo para um bucket público do Supabase Storage e
 * retorna a URL pública. Usar apenas em server actions (após validar o login).
 */
export async function uploadPublic(bucket: string, file: File): Promise<string> {
  const service = createServiceClient();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await service.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  return service.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
