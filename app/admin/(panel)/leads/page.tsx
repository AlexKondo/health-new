import Link from "next/link";
import KanbanBoard from "@/components/admin/KanbanBoard";
import { requireUser } from "@/lib/admin";
import {
  addColumn,
  deleteColumn,
  deleteLead,
  renameColumn,
  reorderColumns,
  setColumnWidth,
  setScheduledAt,
  updateColumnColor,
  updateStatus,
} from "./actions";

export default async function LeadsPage() {
  const { sb, user } = await requireUser();
  const [{ data: leads }, { data: statuses }, { data: history }, { data: widthPrefs }] = await Promise.all([
    sb.from("leads").select("*").order("created_at", { ascending: false }),
    sb.from("lead_statuses").select("*").order("sort_order"),
    sb.from("lead_status_history").select("*").order("changed_at"),
    sb.from("user_column_prefs").select("column_id,width_px").eq("user_email", user.email ?? ""),
  ]);

  const widthByColumn = Object.fromEntries((widthPrefs ?? []).map((p) => [p.column_id, p.width_px]));
  const columns = (statuses ?? []).map((c) => ({ ...c, width_px: widthByColumn[c.id] ?? c.width_px }));

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
            columns={columns}
            history={history ?? []}
            me={user.email ?? ""}
            updateStatus={updateStatus}
            setScheduledAt={setScheduledAt}
            addColumn={addColumn}
            deleteColumn={deleteColumn}
            deleteLead={deleteLead}
            reorderColumns={reorderColumns}
            renameColumn={renameColumn}
            updateColumnColor={updateColumnColor}
            setColumnWidth={setColumnWidth}
          />
        </div>
      </div>
    </div>
  );
}
