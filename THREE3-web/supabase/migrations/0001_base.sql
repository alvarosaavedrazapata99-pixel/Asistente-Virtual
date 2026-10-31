-- THREE3 · base de datos v1: leads sin duplicados, órdenes, pagos y avisos de pasarela.
-- Todas las tablas tienen seguridad por fila (RLS) activada y SIN políticas: nadie entra con la clave pública.
-- Solo el servidor, con la clave de servicio, lee y escribe.

create table contactos (
  id bigint generated always as identity primary key,
  nombre text not null,
  negocio text not null default '',
  email_norm text not null default '',
  celular_norm text not null default '',
  primera_vez timestamptz not null default now(),
  ultima_vez timestamptz not null default now(),
  total_solicitudes int not null default 0,
  consentimiento_en timestamptz not null default now(),
  estado text not null default 'nuevo' check (estado in ('nuevo','contactado','cotizado','cliente','descartado')),
  check (email_norm <> '' or celular_norm <> '')
);
create unique index contactos_email_unico on contactos (email_norm) where email_norm <> '';
create unique index contactos_celular_unico on contactos (celular_norm) where celular_norm <> '';

create table solicitudes (
  id bigint generated always as identity primary key,
  contacto_id bigint not null references contactos (id),
  servicio_id text not null,
  detalle text not null default '',
  utm_source text not null default 'directo',
  utm_medium text not null default 'none',
  utm_campaign text not null default 'none',
  dispositivo text not null default '',
  estado text not null default 'nueva' check (estado in ('nueva','contactada','cotizada','aceptada','perdida','duplicada')),
  clave_dedupe text not null unique,           -- contacto | servicio | día (UTC)
  intentos_duplicados int not null default 0,
  creado_en timestamptz not null default now()
);

create table idempotencia (
  clave text primary key,
  creado_en timestamptz not null default now()
);

create table ordenes (
  id text primary key default ('ord_' || replace(gen_random_uuid()::text, '-', '')),
  token_hash text not null,                    -- solo el hash del enlace de pago; el token no se guarda
  servicio_id text not null,
  descripcion text not null,
  monto_pen numeric(12,2) not null check (monto_pen > 0 and monto_pen <= 100000),
  estado text not null default 'creado' check (estado in ('creado','pagado','en_proceso','en_revision','entregado','cerrado','fallido','reembolsado')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table orden_eventos (
  id bigint generated always as identity primary key,
  orden_id text not null references ordenes (id),
  de text not null, a text not null, motivo text not null default '',
  en timestamptz not null default now()
);

create table webhook_eventos (
  proveedor text not null,
  evento_id text not null,
  payload jsonb not null,
  recibido_en timestamptz not null default now(),
  primary key (proveedor, evento_id)           -- repetir un aviso no cambia nada
);

create table pagos (
  id bigint generated always as identity primary key,
  proveedor text not null,
  pago_externo_id text not null,
  orden_id text not null references ordenes (id),
  estado_proveedor text not null,
  monto numeric(12,2) not null,
  moneda text not null,
  metodo text not null default '',
  actualizado_en timestamptz not null default now(),
  unique (proveedor, pago_externo_id)
);

create table anomalias (
  id bigint generated always as identity primary key,
  orden_id text,
  tipo text not null,
  detalle jsonb not null default '{}'::jsonb,
  en timestamptz not null default now()
);

alter table contactos enable row level security;
alter table solicitudes enable row level security;
alter table idempotencia enable row level security;
alter table ordenes enable row level security;
alter table orden_eventos enable row level security;
alter table webhook_eventos enable row level security;
alter table pagos enable row level security;
alter table anomalias enable row level security;

-- Registro atómico de un lead. Los datos llegan ya normalizados desde el servidor.
-- p->>'ahora' solo existe para pruebas; el endpoint público nunca lo envía.
create or replace function registrar_lead(p jsonb) returns jsonb language plpgsql as $$
declare
  v_email text := coalesce(p->>'email_norm', '');
  v_cel text := coalesce(p->>'celular_norm', '');
  v_idem text := nullif(p->>'idempotency_key', '');
  v_ahora timestamptz := coalesce((p->>'ahora')::timestamptz, now());
  v_contacto bigint;
  v_creada boolean;
begin
  if v_email = '' and v_cel = '' then raise exception 'contacto_requerido'; end if;

  if v_idem is not null then
    insert into idempotencia (clave) values (v_idem) on conflict do nothing;
    if not found then return jsonb_build_object('estado', 'reintento'); end if;
  end if;

  select id into v_contacto from contactos
   where (v_email <> '' and email_norm = v_email) or (v_cel <> '' and celular_norm = v_cel)
   order by id limit 1;

  if v_contacto is null then
    begin
      insert into contactos (nombre, negocio, email_norm, celular_norm, primera_vez, ultima_vez, consentimiento_en)
      values (p->>'nombre', coalesce(p->>'negocio', ''), v_email, v_cel, v_ahora, v_ahora, v_ahora)
      returning id into v_contacto;
    exception when unique_violation then
      -- otro envío simultáneo lo creó primero
      select id into v_contacto from contactos
       where (v_email <> '' and email_norm = v_email) or (v_cel <> '' and celular_norm = v_cel)
       order by id limit 1;
    end;
  else
    update contactos set ultima_vez = v_ahora where id = v_contacto;
    if v_email <> '' then
      update contactos set email_norm = v_email
       where id = v_contacto and email_norm = '' and not exists (select 1 from contactos c where c.email_norm = v_email);
    end if;
    if v_cel <> '' then
      update contactos set celular_norm = v_cel
       where id = v_contacto and celular_norm = '' and not exists (select 1 from contactos c where c.celular_norm = v_cel);
    end if;
  end if;

  insert into solicitudes (contacto_id, servicio_id, detalle, utm_source, utm_medium, utm_campaign, dispositivo, clave_dedupe, creado_en)
  values (v_contacto, p->>'servicio_id', coalesce(p->>'detalle', ''),
          coalesce(p->>'utm_source', 'directo'), coalesce(p->>'utm_medium', 'none'), coalesce(p->>'utm_campaign', 'none'),
          coalesce(p->>'dispositivo', ''),
          v_contacto || '|' || (p->>'servicio_id') || '|' || to_char(v_ahora at time zone 'utc', 'YYYY-MM-DD'), v_ahora)
  on conflict (clave_dedupe) do update set intentos_duplicados = solicitudes.intentos_duplicados + 1
  returning (xmax = 0) into v_creada;

  if v_creada then
    update contactos set total_solicitudes = total_solicitudes + 1 where id = v_contacto;
    return jsonb_build_object('estado', 'creado', 'contacto_id', v_contacto);
  end if;
  return jsonb_build_object('estado', 'duplicado', 'contacto_id', v_contacto);
end $$;

do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function registrar_lead(jsonb) from public, anon, authenticated;
  end if;
end $$;
