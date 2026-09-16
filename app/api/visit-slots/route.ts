import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TZ = "America/Sao_Paulo";
const MAX_DAYS_AHEAD = 60;

function weekdayInTz(dateStr: string) {
  // meio-dia evita virar o dia por causa de fuso na conversão
  const d = new Date(`${dateStr}T12:00:00`);
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
}

function slotDate(dateStr: string, hh: number, mm: number) {
  // Constrói o instante UTC correspondente a hh:mm no fuso America/Sao_Paulo
  // usando o offset relatado pelo Intl para aquele dia (cobre horário de verão, se houver).
  const probe = new Date(`${dateStr}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(probe);
  const localHour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const localMinute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const diffMinutes = (hh * 60 + mm) - (localHour * 60 + localMinute);
  return new Date(probe.getTime() + diffMinutes * 60000);
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!DATE_RE.test(date)) return NextResponse.json({ error: "Data inválida" }, { status: 400 });

  const today = new Date();
  const maxDate = new Date(today.getTime() + MAX_DAYS_AHEAD * 86400000);
  const requested = new Date(`${date}T12:00:00`);
  if (requested < new Date(today.toDateString()) || requested > maxDate) {
    return NextResponse.json({ slots: [] });
  }

  const weekday = weekdayInTz(date);
  const sb = createServiceClient();

  const { data: windows, error } = await sb
    .from("visit_windows")
    .select("*")
    .eq("weekday", weekday)
    .eq("active", true);
  if (error) return NextResponse.json({ error: "Falha ao buscar horários" }, { status: 500 });
  if (!windows || windows.length === 0) return NextResponse.json({ slots: [] });

  const dayStart = slotDate(date, 0, 0);
  const dayEnd = slotDate(date, 23, 59);
  const { data: booked } = await sb
    .from("leads")
    .select("scheduled_at")
    .gte("scheduled_at", dayStart.toISOString())
    .lte("scheduled_at", dayEnd.toISOString())
    .neq("status", "perdido");

  const bookedCounts = new Map<string, number>();
  for (const row of booked ?? []) {
    if (!row.scheduled_at) continue;
    const key = new Date(row.scheduled_at).toISOString();
    bookedCounts.set(key, (bookedCounts.get(key) ?? 0) + 1);
  }

  const now = new Date();
  const slots: { at: string; label: string }[] = [];
  for (const w of windows) {
    const [startH, startM] = String(w.start_time).split(":").map(Number);
    const [endH, endM] = String(w.end_time).split(":").map(Number);
    let cursorMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    while (cursorMinutes + w.slot_minutes <= endMinutes) {
      const hh = Math.floor(cursorMinutes / 60);
      const mm = cursorMinutes % 60;
      const at = slotDate(date, hh, mm);
      if (at > now) {
        const key = at.toISOString();
        const count = bookedCounts.get(key) ?? 0;
        if (count < w.capacity) {
          slots.push({
            at: key,
            label: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
          });
        }
      }
      cursorMinutes += w.slot_minutes;
    }
  }

  slots.sort((a, b) => a.at.localeCompare(b.at));
  return NextResponse.json({ slots });
}
