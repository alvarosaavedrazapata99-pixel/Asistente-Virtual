import { test } from "node:test";
import assert from "node:assert/strict";
import { almacenAdminLeads, manejarAdminLeads, type DepAdminLeads } from "./admin.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";

function dep(extra: Partial<DepAdminLeads> = {}) {
  const cambios: [number, string][] = [];
  const d: DepAdminLeads = {
    adminToken: "clave_larga_de_prueba", limitador: contadorMemoria(),
    listar: async () => [{ id: 1, servicio_id: "diagnostico", detalle: "", utm_source: "directo", utm_campaign: "none", estado: "nueva", intentos_duplicados: 0, creado_en: "2026-11-05", contactos: { id: 1, nombre: "Ana", negocio: "", email_norm: "", celular_norm: "999111222" } }],
    actualizar: async (id, estado) => { cambios.push([id, estado]); },
    ...extra,
  };
  return { d, cambios };
}
const pet = (metodo: string, token?: string, cuerpo?: unknown) =>
  new Request("https://x.test/api/admin/leads", { method: metodo, headers: token ? { authorization: `Bearer ${token}` } : {}, body: cuerpo ? JSON.stringify(cuerpo) : undefined });

test("admin leads: sin clave o con clave falsa → 401", async () => {
  const { d } = dep();
  assert.equal((await manejarAdminLeads(pet("GET"), d)).status, 401);
  assert.equal((await manejarAdminLeads(pet("GET", "otra"), d)).status, 401);
  assert.equal((await manejarAdminLeads(pet("GET", "clave_larga_de_prueba"), dep({ adminToken: "" }).d)).status, 401);
});

test("admin leads: con clave lista las solicitudes", async () => {
  const r = await manejarAdminLeads(pet("GET", "clave_larga_de_prueba"), dep().d);
  assert.equal(r.status, 200);
  assert.equal(((await r.json()) as { leads: unknown[] }).leads.length, 1);
});

test("admin leads: cambia estado válido y rechaza inválido", async () => {
  const { d, cambios } = dep();
  assert.equal((await manejarAdminLeads(pet("PATCH", "clave_larga_de_prueba", { id: 1, estado: "contactada" }), d)).status, 200);
  assert.deepEqual(cambios, [[1, "contactada"]]);
  assert.equal((await manejarAdminLeads(pet("PATCH", "clave_larga_de_prueba", { id: 1, estado: "hackeado" }), d)).status, 422);
  assert.equal((await manejarAdminLeads(pet("PATCH", "clave_larga_de_prueba", { id: -3, estado: "nueva" }), d)).status, 422);
  assert.equal((await manejarAdminLeads(pet("DELETE", "clave_larga_de_prueba"), d)).status, 405);
});

test("admin leads: tras 60 intentos por hora se bloquea", async () => {
  const { d } = dep();
  let ultimo = 0;
  for (let i = 0; i < 62; i++) ultimo = (await manejarAdminLeads(pet("GET", "mala"), d)).status;
  assert.equal(ultimo, 429);
});

test("almacén: pide el recurso embebido y usa apikey sin Bearer con llave sb_", async () => {
  const urls: string[] = []; let cab: Record<string, string> = {};
  const f = (async (u: string, init: RequestInit) => { urls.push(u); cab = init.headers as Record<string, string>; return new Response("[]", { status: 200 }); }) as unknown as typeof fetch;
  await almacenAdminLeads({ url: "https://p.supabase.co/", clave: "sb_secret_x", fetch: f }).listar();
  assert.match(urls[0], /\/rest\/v1\/solicitudes\?select=.*contactos/);
  assert.equal(cab.apikey, "sb_secret_x");
  assert.equal(cab.Authorization, undefined);
});
