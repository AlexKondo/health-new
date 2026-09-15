-- Permite sobrescrever manualmente os cards de Visitas e Tempo médio no
-- dashboard, quando o valor calculado automaticamente estiver estranho.

insert into public.site_settings (key, value) values
  ('visits_override', ''),
  ('avg_duration_override_seconds', '')
on conflict do nothing;
