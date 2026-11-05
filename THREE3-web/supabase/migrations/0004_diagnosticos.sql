-- THREE3 · diagnóstico automático: respuestas, resultado y clasificación del interés. RLS activada y sin políticas (solo el servidor).
create table diagnosticos (
  id bigint generated always as identity primary key,
  contacto_id bigint references contactos (id),
  rubro text not null,
  respuestas jsonb not null,
  resultado jsonb not null,                       -- lo recalcula el servidor; nunca se confía en el navegador
  interes text not null check (interes in ('muy','interesado','explorando')),
  puntos int not null,
  madurez int not null,
  plan_sugerido text not null,
  correo_cliente boolean not null default false,  -- ¿se envió copia al cliente?
  aviso_enviado boolean not null default false,   -- ¿se avisó a THREE3?
  estado text not null default 'nuevo' check (estado in ('nuevo','contactado','cotizado','cliente','descartado')),
  clave_idem text unique,
  creado_en timestamptz not null default now()
);
create index diagnosticos_por_interes on diagnosticos (interes, id desc);
alter table diagnosticos enable row level security;
