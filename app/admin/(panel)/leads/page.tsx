import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/admin";

const STATUSES = ["novo", "contatado", "agendado", "convertido", "perdido"];

async function updateStatus(formData: FormData) {
  "use server";
  const { sb } = await requireUser();
  await sb
    .from("leads")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/leads");
}

export default async function LeadsPage() {
  const { sb } = await requireUser();
  const { data: leads } = await sb.from("leads").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Agendamentos de visita</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-brand-soft/60 text-left">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Série / Período</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((l) => (
              <tr key={l.id} className="border-t border-brand-soft/60 align-top">
                <td className="p-3 whitespace-nowrap text-foreground/60">
                  {new Date(l.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3">
                  <p className="font-semibold">{l.name}</p>
                  {l.message && <p className="text-xs text-foreground/50 max-w-xs">{l.message}</p>}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {l.phone && <div>{l.phone}</div>}
                  {l.email && <div className="text-foreground/60">{l.email}</div>}
                </td>
                <td className="p-3 whitespace-nowrap">{[l.child_grade, l.period].filter(Boolean).join(" · ")}</td>
                <td className="p-3">
                  <form action={updateStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={l.id} />
                    <select name="status" defaultValue={l.status} className="rounded-lg border border-brand-soft px-2 py-1">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="text-xs font-semibold text-brand hover:underline">salvar</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!leads || leads.length === 0) && (
              <tr><td colSpan={5} className="p-6 text-center text-foreground/60">Nenhum agendamento ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
