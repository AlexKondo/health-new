-- Substitui a lógica de bloqueio (antes feita em JS com leitura+escrita
-- separadas, vulnerável a corrida e a chamadas diretas na API) por duas
-- funções atômicas no banco, chamadas de dentro da própria rota de login
-- no servidor — nunca a partir do navegador sem uma tentativa real de senha.

create or replace function public.check_login_lock(p_email text)
returns table (blocked boolean, permanent boolean, retry_after_seconds int)
language plpgsql
as $$
declare
  r public.login_attempts%rowtype;
begin
  select * into r from public.login_attempts where email = p_email;

  if r.permanently_blocked then
    return query select true, true, null::int;
    return;
  end if;

  if r.locked_until is not null and r.locked_until > now() then
    return query select true, false, ceil(extract(epoch from (r.locked_until - now())))::int;
    return;
  end if;

  return query select false, false, null::int;
end;
$$;

create or replace function public.record_login_result(p_email text, p_success boolean)
returns table (blocked boolean, permanent boolean, retry_after_seconds int)
language plpgsql
as $$
declare
  r public.login_attempts%rowtype;
  fails_per_cycle int[] := array[3, 5, 5, 5, 5];
  stage_seconds   int[] := array[60, 300, 1200, 3600];
  threshold int;
  next_stage int;
  secs int;
begin
  if p_success then
    delete from public.login_attempts where email = p_email;
    return query select false, false, null::int;
    return;
  end if;

  insert into public.login_attempts (email, fail_count)
  values (p_email, 1)
  on conflict (email) do update set fail_count = login_attempts.fail_count + 1, updated_at = now()
  returning * into r;

  if r.permanently_blocked then
    return query select true, true, null::int;
    return;
  end if;

  threshold := fails_per_cycle[least(r.lockout_stage + 1, array_length(fails_per_cycle, 1))];
  if r.fail_count < threshold then
    return query select false, false, null::int;
    return;
  end if;

  next_stage := r.lockout_stage + 1;

  if next_stage > array_length(stage_seconds, 1) then
    update public.login_attempts
      set fail_count = 0, lockout_stage = next_stage, locked_until = null,
          permanently_blocked = true, updated_at = now()
      where email = p_email;
    return query select true, true, null::int;
    return;
  end if;

  secs := stage_seconds[next_stage];
  update public.login_attempts
    set fail_count = 0, lockout_stage = next_stage,
        locked_until = now() + (secs || ' seconds')::interval, updated_at = now()
    where email = p_email;
  return query select true, false, secs;
end;
$$;

grant execute on function public.check_login_lock(text) to service_role;
grant execute on function public.record_login_result(text, boolean) to service_role;
