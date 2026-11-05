import { test } from "node:test";
import assert from "node:assert/strict";
import { almacenAdminClientes, manejarAdminClientes, validarCliente, type DepAdminClientes } from "./admin.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";

const KEY = "clave_larga_de_prueba";
const buena = { id: "don-beto", nombre: "Pollería Don Beto", descripcion: "Pollo a la brasa. Abierto de 12 a 11.", color: "#C0392B", whatsapp: "+51 999 111 222", dominios: ["https://www.donbeto.pe/", "https://donbeto.pe"], limite_diario: 200, activo: true };

function dep(extra: Partial<DepAdminClientes> = {}) {
  const guardados: unknown[] = [];
  const d: DepAdminClientes = {
    adminToken: KEY, limitador: contadorMemoria(),
    listar: async () => [{ id: "don-beto", nombre: "Don Beto", activo: true, dominios: ["https://donbeto.pe"], limite_diario: 200, whatsapp: "", color: "#C0392B" }],
    obtener: async (id) => (id === "don-beto" ? { ...(buena as object), saludo: "Hola", whatsapp: "51999111222", dominios: ["https://donbeto.pe"] } as never : null),
    guardar: async (c) => { guardados.push(c); },
    leads: async () => [{ id: 1, nombre: "Ana", contacto: "999111222", detalle: "", creado_en: "2026-11-05" }],
    ...extra,
  };
  return { d, guardados };
}
const pet = (m: string, token?: string, cuerpo?: unknown, qs = "") =>
  new Request("https://x.test/api/admin/clientes" + qs, { method: m, headers: token ? { authorization: `Bearer ${token}` } : {}, body: cuerpo ? JSON.stringify(cuerpo) : undefined });

test("validación: limpia y normaliza", () => {
  const v = validarCliente(buena);
  assert.ok(typeof v !== "string");
  if (typeof v !== "string") {
    assert.equal(v.whatsapp, "51999111222");
    assert.deepEqual(v.dominios, ["https://www.donbeto.pe", "https://donbeto.pe"]);
    assert.equal(v.saludo.length > 0, true);
    assert.equal(v.activo, true);
  }
});

test("validación: rechaza id, color, dominios con ruta o sin esquema, límites y descripción corta", () => {
  assert.equal(validarCliente({ ...buena, id: "Don Beto" }), "id");
  assert.equal(validarCliente({ ...buena, color: "rojo" }), "color");
  assert.equal(validarCliente({ ...buena, dominios: ["https://donbeto.pe/ruta"] }), "dominios");
  assert.equal(validarCliente({ ...buena, dominios: ["donbeto.pe"] }), "dominios");
  assert.equal(validarCliente({ ...buena, dominios: [] }), "dominios");
  assert.equal(validarCliente({ ...buena, dominios: ["javascript:alert(1)"] }), "dominios");
  assert.equal(validarCliente({ ...buena, limite_diario: 0 }), "limite_diario");
  assert.equal(validarCliente({ ...buena, descripcion: "corta" }), "descripcion");
  assert.equal(validarCliente({ ...buena, whatsapp: "123" }), "whatsapp");
  assert.equal(validarCliente({ ...buena, nombre: "A" }), "nombre");
});

test("sin clave o con clave falsa → 401", async () => {
  const { d } = dep();
  assert.equal((await manejarAdminClientes(pet("GET"), d)).status, 401);
  assert.equal((await manejarAdminClientes(pet("GET", "otra"), d)).status, 401);
  assert.equal((await manejarAdminClientes(pet("GET", KEY), dep({ adminToken: "" }).d)).status, 401);
});

test("lista, detalle, leads y creación con la clave correcta", async () => {
  const { d, guardados } = dep();
  assert.equal(((await (await manejarAdminClientes(pet("GET", KEY), d)).json()) as { clientes: unknown[] }).clientes.length, 1);
  assert.equal((await manejarAdminClientes(pet("GET", KEY, undefined, "?id=don-beto"), d)).status, 200);
  assert.equal((await manejarAdminClientes(pet("GET", KEY, undefined, "?id=nadie"), d)).status, 404);
  assert.equal((await manejarAdminClientes(pet("GET", KEY, undefined, "?id=../x"), d)).status, 422);
  assert.equal(((await (await manejarAdminClientes(pet("GET", KEY, undefined, "?leads=don-beto"), d)).json()) as { leads: unknown[] }).leads.length, 1);
  assert.equal((await manejarAdminClientes(pet("POST", KEY, buena), d)).status, 200);
  assert.equal(guardados.length, 1);
  assert.equal((await manejarAdminClientes(pet("POST", KEY, { ...buena, dominios: ["x"] }), d)).status, 422);
  assert.equal(guardados.length, 1);
  assert.equal((await manejarAdminClientes(pet("DELETE", KEY), d)).status, 405);
});

test("tras 120 intentos por hora se bloquea", async () => {
  const { d } = dep();
  let ultimo = 0;
  for (let i = 0; i < 122; i++) ultimo = (await manejarAdminClientes(pet("GET", "mala"), d)).status;
  assert.equal(ultimo, 429);
});

test("almacén: upsert por id y llave sb_ solo en apikey", async () => {
  const llamadas: { u: string; init: RequestInit }[] = [];
  const f = (async (u: string, init: RequestInit) => { llamadas.push({ u, init }); return new Response("[]", { status: 200 }); }) as unknown as typeof fetch;
  const a = almacenAdminClientes({ url: "https://p.supabase.co/", clave: "sb_secret_q", fetch: f });
  await a.guardar({ ...(buena as object), saludo: "x", whatsapp: "51999111222" } as never);
  assert.match(llamadas[0].u, /clientes_bot\?on_conflict=id$/);
  const h = llamadas[0].init.headers as Record<string, string>;
  assert.match(h.Prefer, /merge-duplicates/);
  assert.equal(h.Authorization, undefined);
});
