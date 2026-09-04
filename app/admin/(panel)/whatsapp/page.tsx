import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

async function togglePause(formData: FormData) {
  "use server";
  const { sb } = await requireUser();
  const phone = String(formData.get("phone"));
  const paused = formData.get("paused") === "true";
  await sb.from("wa_contacts").update({ bot_paused: !paused }).eq("phone", phone);
  revalidatePath("/admin/whatsapp");
}

export default async function WhatsAppPage() {
  const { sb } = await requireUser();
  const { data: contacts } = await sb
    .from("wa_contacts")
    .select("*")
    .order("updated_at", { ascending: false });

  const { data: lastMsgs } = await sb
    .from("wa_messages")
    .select("phone, content, direction, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const lastByPhone = new Map<string, { content: string; direction: string }>();
  for (const m of lastMsgs ?? []) if (!lastByPhone.has(m.phone)) lastByPhone.set(m.phone, m);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Conversas no WhatsApp</h1>
      <p className="mt-1 text-sm text-foreground/60">
        O agente de IA responde automaticamente. Pause para assumir a conversa manualmente.
      </p>

      <div className="mt-6 space-y-2">
        {(contacts ?? []).map((c) => {
          const last = lastByPhone.get(c.phone);
          return (
            <div key={c.phone} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="font-bold">{c.name || c.phone}</p>
                {last && (
                  <p className="truncate text-sm text-foreground/60">
                    {last.direction === "in" ? "↘ " : "↗ "}{last.content}
                  </p>
                )}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${c.bot_paused ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                {c.bot_paused ? "Bot pausado" : "Bot ativo"}
              </span>
              <form action={togglePause}>
                <input type="hidden" name="phone" value={c.phone} />
                <input type="hidden" name="paused" value={String(c.bot_paused)} />
                <button className="text-sm font-semibold text-brand hover:underline">
                  {c.bot_paused ? "Reativar bot" : "Pausar bot"}
                </button>
              </form>
            </div>
          );
        })}
        {(!contacts || contacts.length === 0) && (
          <p className="text-foreground/60">Nenhuma conversa ainda. Configure o webhook do WhatsApp para começar.</p>
        )}
      </div>
    </div>
  );
}
