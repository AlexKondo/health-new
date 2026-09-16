-- Simplifica a regra de bloqueio por e-mail: em vez de ciclos de N erros
-- cada um, agora é uma contagem total de erros seguidos (não reseta ao
-- expirar um bloqueio, só reseta no sucesso):
--   1º e 2º erro  -> só mostra "senha inválida"
--   3º erro       -> bloqueia 1 minuto
--   4º erro       -> bloqueia 5 minutos
--   5º erro       -> bloqueio permanente

create or replace function public.record_login_result(p_email text, p_success boolean)
returns table (blocked boolean, permanent boolean, retry_after_seconds int)
language plpgsql
as $$
declare
  r public.login_attempts%rowtype;
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

  if r.fail_count <= 2 then
    return query select false, false, null::int;
    return;
  end if;

  if r.fail_count >= 5 then
    update public.login_attempts
      set lockout_stage = 3, locked_until = null, permanently_blocked = true, updated_at = now()
      where email = p_email;
    return query select true, true, null::int;
    return;
  end if;

  secs := case r.fail_count when 3 then 60 when 4 then 300 end;
  update public.login_attempts
    set lockout_stage = r.fail_count - 2, locked_until = now() + (secs || ' seconds')::interval, updated_at = now()
    where email = p_email;
  return query select true, false, secs;
end;
$$;

grant execute on function public.record_login_result(text, boolean) to service_role;
