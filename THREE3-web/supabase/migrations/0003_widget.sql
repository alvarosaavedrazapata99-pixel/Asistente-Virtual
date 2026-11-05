-- THREE3 · bot incrustable para clientes. RLS activada y sin políticas: solo el servidor (llave secreta) accede.

create table clientes_bot (
  id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),     -- se usa en data-cliente del fragmento
  nombre text not null,
  descripcion text not null check (length(descripcion) <= 6000), -- lo que sabe el bot: servicios, horarios, políticas
  saludo text not null default '¡Hola! Soy el asistente virtual de este negocio. ¿En qué te ayudo?',
  color text not null default '#1E6BFF' check (color ~ '^#[0-9a-fA-F]{6}$'),
  whatsapp text not null default '',                          -- número al que se deriva (con código de país, solo dígitos)
  dominios text[] not null default '{}',                      -- orígenes permitidos, p. ej. https://www.minegocio.pe
  activo boolean not null default false,
  limite_diario int not null default 300 check (limite_diario between 1 and 5000),
  creado_en timestamptz not null default now()
);

create table leads_cliente (
  id bigint generated always as identity primary key,
  cliente text not null references clientes_bot (id),
  nombre text not null,
  contacto text not null,                                     -- correo o celular normalizado
  detalle text not null default '',
  creado_en timestamptz not null default now()
);
create index leads_cliente_por_cliente on leads_cliente (cliente, id desc);

alter table clientes_bot enable row level security;
alter table leads_cliente enable row level security;
