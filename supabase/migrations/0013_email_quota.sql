-- Controle de cota diária de e-mails transacionais (Brevo, plano free = 300/dia).
-- record_email_send() confere e incrementa atomicamente (evita passar do
-- limite em corrida de dois e-mails disparados ao mesmo tempo) e bloqueia
-- o envio assim que o dia atingir p_max.

create table if not exists public.email_quota (
  day        date primary key,
  sent_count int not null default 0
);

alter table public.email_quota enable row level security;

create policy email_quota_admin_read on public.email_quota
  for select to authenticated using (true);

create or replace function public.record_email_send(p_max int default 300)
returns table (allowed boolean, sent_count int)
language plpgsql
as $$
#variable_conflict use_column
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_count int;
begin
  insert into public.email_quota (day, sent_count)
  values (v_today, 0)
  on conflict (day) do nothing;

  select sent_count into v_count from public.email_quota where day = v_today for update;

  if v_count >= p_max then
    return query select false, v_count;
    return;
  end if;

  update public.email_quota set sent_count = sent_count + 1
    where day = v_today
    returning sent_count into v_count;

  return query select true, v_count;
end;
$$;

grant execute on function public.record_email_send(int) to service_role;
