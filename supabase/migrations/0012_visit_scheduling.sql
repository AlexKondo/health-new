-- Agendamento de visita com data/horário real: janelas de disponibilidade
-- configuráveis pelo admin, horário escolhido gravado no lead, e um RPC
-- atômico que confere capacidade antes de inserir (evita overbooking em
-- corrida de duas pessoas reservando o mesmo horário ao mesmo tempo).

create table if not exists public.visit_windows (
  id           uuid primary key default gen_random_uuid(),
  weekday      int not null check (weekday between 0 and 6), -- 0=domingo … 6=sábado
  start_time   time not null,
  end_time     time not null check (end_time > start_time),
  slot_minutes int not null default 60 check (slot_minutes > 0),
  capacity     int not null default 1 check (capacity > 0),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.visit_windows enable row level security;

create policy visit_windows_public_read on public.visit_windows
  for select using (active);

create policy visit_windows_admin_all on public.visit_windows
  for all to authenticated using (true) with check (true);

alter table public.leads
  add column if not exists scheduled_at timestamptz;

create index if not exists leads_scheduled_at_idx on public.leads (scheduled_at);

create or replace function public.book_lead(
  p_name text,
  p_email text,
  p_phone text,
  p_child_grade text,
  p_period text,
  p_message text,
  p_scheduled_at timestamptz
) returns table (id uuid, error text)
language plpgsql
as $$
declare
  v_weekday int;
  v_time time;
  v_capacity int;
  v_booked int;
  v_id uuid;
begin
  if p_scheduled_at is not null then
    v_weekday := extract(dow from (p_scheduled_at at time zone 'America/Sao_Paulo'));
    v_time := (p_scheduled_at at time zone 'America/Sao_Paulo')::time;

    select w.capacity into v_capacity
      from public.visit_windows w
      where w.weekday = v_weekday and w.active
        and v_time >= w.start_time and v_time < w.end_time
      limit 1;

    if v_capacity is null then
      return query select null::uuid, 'Horário fora da janela disponível.';
      return;
    end if;

    select count(*) into v_booked
      from public.leads l
      where l.scheduled_at = p_scheduled_at and l.status <> 'perdido';

    if v_booked >= v_capacity then
      return query select null::uuid, 'Esse horário já está lotado.';
      return;
    end if;
  end if;

  insert into public.leads (name, email, phone, child_grade, period, message, scheduled_at)
  values (p_name, p_email, p_phone, p_child_grade, p_period, p_message, p_scheduled_at)
  returning leads.id into v_id;

  return query select v_id, null::text;
end;
$$;

grant execute on function public.book_lead(text, text, text, text, text, text, timestamptz) to anon, service_role;
