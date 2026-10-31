import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const sql = readFileSync(new URL("../supabase/migrations/0001_base.sql", import.meta.url), "utf8");

async function nuevaBase() {
  const db = new PGlite();
  await db.exec(sql);
  const lead = async (p: Record<string, unknown>) => {
    const r = await db.query<{ r: { estado: string } }>("select registrar_lead($1::jsonb) as r", [JSON.stringify(p)]);
    return r.rows[0].r.estado;
  };
  return { db, lead };
}
const base = { nombre: "Ana", email_norm: "ana@correo.com", celular_norm: "", servicio_id: "crm", ahora: "2026-11-02T10:00:00Z" };

test("registrar_lead: creado, duplicado y reintento", async () => {
  const { lead } = await nuevaBase();
  assert.equal(await lead({ ...base, idempotency_key: "k1" }), "creado");
  assert.equal(await lead({ ...base, idempotency_key: "k1" }), "reintento");
  assert.equal(await lead({ ...base, idempotency_key: "k2" }), "duplicado");
  assert.equal(await lead({ ...base, idempotency_key: "k3", servicio_id: "chatbot" }), "creado");
  assert.equal(await lead({ ...base, idempotency_key: "k4", ahora: "2026-11-03T10:00:00Z" }), "creado");
});

test("el mismo contacto se reconoce por correo o por celular", async () => {
  const { db, lead } = await nuevaBase();
  await lead({ ...base, idempotency_key: "a" });
  await lead({ ...base, idempotency_key: "b", celular_norm: "987654321", servicio_id: "leads" }); // trae ambos: completa el celular
  await lead({ nombre: "Ana", email_norm: "", celular_norm: "987654321", servicio_id: "sheets", idempotency_key: "c", ahora: base.ahora });
  const c = await db.query<{ n: number }>("select count(*)::int as n from contactos");
  assert.equal(c.rows[0].n, 1, "un solo contacto");
  const s = await db.query<{ n: number }>("select count(*)::int as n from solicitudes");
  assert.equal(s.rows[0].n, 3);
});

test("simultáneo: 60 envíos de la misma persona dejan 1 contacto y 1 solicitud", async () => {
  const { db, lead } = await nuevaBase();
  const estados = await Promise.all(Array.from({ length: 60 }, (_, i) => lead({ ...base, idempotency_key: `k${i}` })));
  assert.equal(estados.filter((e) => e === "creado").length, 1);
  assert.equal(estados.filter((e) => e === "duplicado").length, 59);
  const r = await db.query<{ c: number; s: number; d: number }>("select (select count(*) from contactos)::int c, (select count(*) from solicitudes)::int s, (select intentos_duplicados from solicitudes limit 1)::int d");
  assert.deepEqual(r.rows[0], { c: 1, s: 1, d: 59 });
});

test("la base rechaza duplicados aunque se salte la función", async () => {
  const { db, lead } = await nuevaBase();
  await lead({ ...base, idempotency_key: "k" });
  await assert.rejects(() => db.query("insert into contactos (nombre, email_norm) values ('X', 'ana@correo.com')"));
  await assert.rejects(() => db.query("insert into contactos (nombre) values ('sin contacto')"));
});

test("webhook_eventos y pagos: la clave única impide repetidos; el monto debe ser positivo", async () => {
  const { db } = await nuevaBase();
  await db.query("insert into webhook_eventos (proveedor, evento_id, payload) values ('mp','1:approved','{}')");
  await assert.rejects(() => db.query("insert into webhook_eventos (proveedor, evento_id, payload) values ('mp','1:approved','{}')"));
  await assert.rejects(() => db.query("insert into ordenes (token_hash, servicio_id, descripcion, monto_pen) values ('h','crm','x',0)"));
  const o = await db.query<{ id: string }>("insert into ordenes (token_hash, servicio_id, descripcion, monto_pen) values ('h','crm','CRM',2500) returning id");
  assert.match(o.rows[0].id, /^ord_[a-f0-9]{32}$/);
});
