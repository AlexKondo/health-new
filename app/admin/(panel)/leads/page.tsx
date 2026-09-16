import Link from "next/link";
import KanbanBoard from "@/components/admin/KanbanBoard";
import { requireUser } from "@/lib/admin";
import { addColumn, deleteColumn, reorderColumns, setScheduledAt, updateColumnStyle, updateStatus } from "./actions";

export default async function LeadsPage() {
  const { sb, user } = await requireUser();
  const [{ data: leads }, { data: statuses }] = await Promise.all([
    sb.from("leads").select("*").order("created_at", { ascending: false }),
    sb.from("lead_statuses").select("*").order("sort_order"),
  ]);

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
          <KanbanBoard
            leads={leads ?? []}
            columns={statuses ?? []}
            me={user.email ?? ""}
            updateStatus={updateStatus}
            setScheduledAt={setScheduledAt}
            addColumn={addColumn}
            deleteColumn={deleteColumn}
            reorderColumns={reorderColumns}
            updateColumnStyle={updateColumnStyle}
          />
        </div>
      </div>
    </div>
  );
}
