-- Ajuste pedido: mais tolerância antes de bloquear, e bloqueio crescente
-- em vez do antigo esquema de bloqueio permanente:
--   1º ao 5º erro  -> só mostra "senha inválida", sem bloqueio
--   6º erro        -> bloqueia 1 minuto
--   7º erro        -> bloqueia 5 minutos
--   8º erro em diante -> bloqueia 10 minutos (não bloqueia mais para sempre)
--
-- O reset no sucesso já existia (delete da linha inteira) e continua igual
-- aqui — é o que zera a contagem e destrava na hora quando a senha certa é
-- usada.

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

  if r.fail_count <= 5 then
    return query select false, false, null::int;
    return;
  end if;

  secs := case
    when r.fail_count = 6 then 60
    when r.fail_count = 7 then 300
    else 600
  end;
  update public.login_attempts
    set lockout_stage = least(r.fail_count - 5, 3), locked_until = now() + (secs || ' seconds')::interval,
        permanently_blocked = false, updated_at = now()
    where email = p_email;
  return query select true, false, secs;
end;
$$;

grant execute on function public.record_login_result(text, boolean) to service_role;
