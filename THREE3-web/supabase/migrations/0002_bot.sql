-- THREE3 · conversaciones del bot de WhatsApp e Instagram.
-- RLS activada y sin políticas: solo el servidor (llave secreta) lee y escribe.

create table mensajes_bot (
  id bigint generated always as identity primary key,
  canal text not null check (canal in ('whatsapp','instagram')),
  contacto text not null,                       -- número de WhatsApp o id de Instagram de la persona
  nombre text not null default '',
  msg_id text unique,                           -- id del mensaje en Meta; evita procesar un aviso repetido
  rol text not null check (rol in ('usuario','bot')),
  texto text not null,
  derivado boolean not null default false,      -- true si se pidió o se pasó a una persona
  creado_en timestamptz not null default now()
);
create index mensajes_bot_conversacion on mensajes_bot (canal, contacto, id desc);
alter table mensajes_bot enable row level security;
