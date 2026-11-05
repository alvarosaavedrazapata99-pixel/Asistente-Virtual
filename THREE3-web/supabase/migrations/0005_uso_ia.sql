-- THREE3 · consumo real de la IA (tokens) por cliente y por origen, para saber cuánto cuesta cada cliente.
create table uso_ia (
  id bigint generated always as identity primary key,
  origen text not null check (origen in ('widget','demo','bot')),
  cliente text not null default '',        -- id del cliente del widget; vacío en demo y bot propio
  modelo text not null,
  tokens_in int not null default 0,        -- entrada sin caché
  tokens_out int not null default 0,       -- salida (incluye el pensamiento del modelo)
  tokens_cache int not null default 0,     -- entrada leída de caché
  creado_en timestamptz not null default now()
);
create index uso_ia_por_mes on uso_ia (creado_en desc);
alter table uso_ia enable row level security;

-- Resumen mensual. security_invoker hace que se aplique la seguridad por fila de la tabla (la clave pública no lo ve).
create view uso_ia_mensual with (security_invoker = true) as
  select cliente, origen, modelo, date_trunc('month', creado_en) as mes, count(*) as llamadas,
         sum(tokens_in)::bigint as tin, sum(tokens_out)::bigint as tout, sum(tokens_cache)::bigint as tcache
  from uso_ia group by 1, 2, 3, 4;

do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on uso_ia_mensual from anon, authenticated;
    revoke all on uso_ia from anon, authenticated;
  end if;
end $$;
