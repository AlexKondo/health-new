import BackLink from "@/components/admin/BackLink";
import DeleteForm from "@/components/admin/DeleteForm";
import { requireUser } from "@/lib/admin";
import { deleteWindow, saveWindow, toggleWindow } from "./actions";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function JanelasPage() {
  const { sb } = await requireUser();
  const { data: windows } = await sb
    .from("visit_windows")
    .select("*")
    .order("weekday")
    .order("start_time");

  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/leads" />
      <h1 className="mt-4 text-2xl font-extrabold text-brand-dark">Horários disponíveis para visita</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Defina os dias e faixas de horário em que a escola recebe visitas. O formulário do site só deixa o
        visitante escolher dentro dessas janelas.
      </p>

      <div className="mt-6 space-y-3">
        {(windows ?? []).map((w) => (
          <div key={w.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="font-bold">
                {WEEKDAYS[w.weekday]} · {String(w.start_time).slice(0, 5)} às {String(w.end_time).slice(0, 5)}
              </p>
              <p className="text-xs text-foreground/60">
                Slots de {w.slot_minutes} min · até {w.capacity} visita{w.capacity > 1 ? "s" : ""} por horário
                {!w.active && " · desativado"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <form action={toggleWindow}>
                <input type="hidden" name="id" value={w.id} />
                <input type="hidden" name="active" value={String(w.active)} />
                <button className="text-sm font-semibold text-brand hover:underline">
                  {w.active ? "Desativar" : "Ativar"}
                </button>
              </form>
              <DeleteForm action={deleteWindow} id={w.id} confirmText="Excluir esse horário disponível?">
                <button className="text-sm text-red-600 hover:underline">Excluir</button>
              </DeleteForm>
            </div>
          </div>
        ))}
        {(!windows || windows.length === 0) && (
          <p className="text-foreground/60">Nenhum horário configurado ainda — o formulário do site não vai oferecer nenhuma data.</p>
        )}
      </div>

      <form action={saveWindow} className="mt-8 grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-bold text-brand-dark">Adicionar horário</h2>
        <label className="block text-sm font-semibold">
          Dia da semana
          <select name="weekday" className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand bg-white">
            {WEEKDAYS.map((label, i) => <option key={i} value={i}>{label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Duração de cada horário (min)
          <input type="number" name="slot_minutes" defaultValue={60} min={15} step={15} required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand" />
        </label>
        <label className="block text-sm font-semibold">
          Início
          <input type="time" name="start_time" required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand" />
        </label>
        <label className="block text-sm font-semibold">
          Fim
          <input type="time" name="end_time" required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand" />
        </label>
        <label className="block text-sm font-semibold">
          Capacidade por horário
          <input type="number" name="capacity" defaultValue={1} min={1} required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand" />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
            + Adicionar horário
          </button>
        </div>
      </form>
    </div>
  );
}
