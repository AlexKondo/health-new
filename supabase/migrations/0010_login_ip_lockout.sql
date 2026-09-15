-- Segunda camada de proteção: bloqueio por IP, independente do bloqueio por
-- e-mail. Mais tolerante (10 erros por ciclo em vez de 3/5, e nunca bloqueia
-- para sempre — IPs são compartilhados/reatribuídos) para não travar uma
-- rede inteira (Wi-Fi de escola, escritório) por causa de uma pessoa.

create table if not exists public.login_ip_attempts (
  ip             text primary key,
  fail_count     int not null default 0,
  lockout_stage  int not null default 0,
  locked_until   timestamptz,
  updated_at     timestamptz not null default now()
);

alter table public.login_ip_attempts enable row level security;
-- Sem políticas públicas: só acessada via service role na API de login.

create or replace function public.check_ip_lock(p_ip text)
returns table (blocked boolean, retry_after_seconds int)
language plpgsql
as $$
declare
  r public.login_ip_attempts%rowtype;
begin
  select * into r from public.login_ip_attempts where ip = p_ip;
  if r.locked_until is not null and r.locked_until > now() then
    return query select true, ceil(extract(epoch from (r.locked_until - now())))::int;
    return;
  end if;
  return query select false, null::int;
end;
$$;

create or replace function public.record_ip_result(p_ip text, p_success boolean)
returns table (blocked boolean, retry_after_seconds int)
language plpgsql
as $$
declare
  r public.login_ip_attempts%rowtype;
  threshold int := 10;
  stage_seconds int[] := array[60, 300, 1200, 3600]; -- repete 1h nos ciclos seguintes
  next_stage int;
  secs int;
begin
  if p_success then
    delete from public.login_ip_attempts where ip = p_ip;
    return query select false, null::int;
    return;
  end if;

  insert into public.login_ip_attempts (ip, fail_count)
  values (p_ip, 1)
  on conflict (ip) do update set fail_count = login_ip_attempts.fail_count + 1, updated_at = now()
  returning * into r;

  if r.fail_count < threshold then
    return query select false, null::int;
    return;
  end if;

  next_stage := least(r.lockout_stage + 1, array_length(stage_seconds, 1));
  secs := stage_seconds[next_stage];
  update public.login_ip_attempts
    set fail_count = 0, lockout_stage = next_stage,
        locked_until = now() + (secs || ' seconds')::interval, updated_at = now()
    where ip = p_ip;
  return query select true, secs;
end;
$$;

grant execute on function public.check_ip_lock(text) to service_role;
grant execute on function public.record_ip_result(text, boolean) to service_role;
