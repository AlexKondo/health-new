import Link from "next/link";
import KanbanBoard from "@/components/admin/KanbanBoard";
import { requireUser } from "@/lib/admin";
import { updateStatus } from "./actions";

export default async function LeadsPage() {
  const { sb } = await requireUser();
  const { data: leads } = await sb.from("leads").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-dark">Agendamentos de visita</h1>
        <Link href="/admin/leads/janelas" className="text-sm font-semibold text-brand hover:underline">
          Configurar horários disponíveis
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/60">Arraste os cards entre as colunas para mudar o status.</p>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <KanbanBoard leads={leads ?? []} updateStatus={updateStatus} />
        </div>
      </div>
    </div>
  );
}
