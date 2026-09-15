-- Upserts atômicos para o rastreamento de visitas (evita corrida entre
-- pageview/duration concorrentes) e uma agregação no banco para o dashboard.

create or replace function public.track_pageview(p_session_id text)
returns void
language sql
as $$
  insert into public.visits (session_id, pageviews, last_seen)
  values (p_session_id, 1, now())
  on conflict (session_id)
  do update set pageviews = visits.pageviews + 1, last_seen = now();
$$;

create or replace function public.track_duration(p_session_id text, p_duration int)
returns void
language sql
as $$
  insert into public.visits (session_id, duration_seconds, last_seen)
  values (p_session_id, greatest(0, p_duration), now())
  on conflict (session_id)
  do update set
    duration_seconds = greatest(visits.duration_seconds, excluded.duration_seconds),
    last_seen = now();
$$;

create or replace function public.visit_stats()
returns table (total_visits bigint, avg_duration_seconds numeric)
language sql
stable
as $$
  select
    count(*)::bigint,
    coalesce(avg(duration_seconds) filter (where duration_seconds > 0), 0)
  from public.visits;
$$;

grant execute on function public.track_pageview(text) to service_role;
grant execute on function public.track_duration(text, int) to service_role;
grant execute on function public.visit_stats() to authenticated;
