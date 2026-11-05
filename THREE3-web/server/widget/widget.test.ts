import { test } from "node:test";
import assert from "node:assert/strict";
import { manejarWidget, sistemaCliente, type ConfigCliente, type DepWidget } from "./chat.ts";
import { almacenWidget } from "./almacen.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";

const ORIGEN = "https://www.donbeto.pe";
const cliente: ConfigCliente = { id: "don-beto", nombre: "Pollería Don Beto", descripcion: "Pollo a la brasa. Abierto de 12 a 11.", saludo: "¡Hola!", color: "#FF0000", whatsapp: "+51 999 111 222", dominios: [ORIGEN], activo: true, limite_diario: 3 };

function dep(extra: Partial<DepWidget> = {}, c: Partial<ConfigCliente> = {}) {
  const leads: unknown[] = [];
  const llamadas: { sistema: string; texto: string }[] = [];
  const d: DepWidget = {
    iaActiva: true, limitador: contadorMemoria(), hoy: () => "2026-11-05",
    buscarCliente: async (id) => (id === "don-beto" ? { ...cliente, ...c } : null),
    guardarLead: async (l) => { leads.push(l); },
    responder: async (sistema, _h, texto) => { llamadas.push({ sistema, texto }); return "Abrimos de 12 a 11."; },
    ...extra,
  };
  return { d, leads, llamadas };
}
const url = (a: string, c = "don-beto") => `https://x.test/api/widget?c=${c}&a=${a}`;
const post = (a: string, cuerpo: unknown, origen: string | null = ORIGEN, c = "don-beto", ip = "1.1.1.1") =>
  new Request(url(a, c), { method: "POST", body: JSON.stringify(cuerpo), headers: { ...(origen ? { origin: origen } : {}), "cf-connecting-ip": ip } });
const chat = { mensajes: [{ rol: "bot", texto: "Hola" }, { rol: "usuario", texto: "¿A qué hora abren?" }] };

test("config: devuelve solo datos públicos y CORS solo para el origen permitido", async () => {
  const r = await manejarWidget(new Request(url("config"), { headers: { origin: ORIGEN } }), dep().d);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("access-control-allow-origin"), ORIGEN);
  const j = (await r.json()) as Record<string, unknown>;
  assert.equal(j["whatsapp"], "51999111222");
  assert.equal(j["descripcion"], undefined);
  assert.equal(j["dominios"], undefined);
});

test("origen no registrado o ausente → 403 sin cabeceras CORS", async () => {
  for (const o of ["https://otro.pe", null]) {
    const r = await manejarWidget(new Request(url("config"), { headers: o ? { origin: o } : {} }), dep().d);
    assert.equal(r.status, 403);
    assert.equal(r.headers.get("access-control-allow-origin"), null);
  }
});

test("cliente inexistente, inactivo o id inválido → 404", async () => {
  assert.equal((await manejarWidget(new Request(url("config", "nadie"), { headers: { origin: ORIGEN } }), dep().d)).status, 404);
  assert.equal((await manejarWidget(new Request(url("config"), { headers: { origin: ORIGEN } }), dep({}, { activo: false }).d)).status, 404);
  assert.equal((await manejarWidget(new Request(url("config", "../x"), { headers: { origin: ORIGEN } }), dep().d)).status, 404);
});

test("preflight OPTIONS: 204 para origen permitido, 403 para otro", async () => {
  const ok = await manejarWidget(new Request(url("chat"), { method: "OPTIONS", headers: { origin: ORIGEN } }), dep().d);
  assert.equal(ok.status, 204);
  assert.match(ok.headers.get("access-control-allow-headers") ?? "", /Content-Type/);
  assert.equal((await manejarWidget(new Request(url("chat"), { method: "OPTIONS", headers: { origin: "https://otro.pe" } }), dep().d)).status, 403);
});

test("chat: responde con las instrucciones del cliente", async () => {
  const { d, llamadas } = dep();
  const r = await manejarWidget(post("chat", chat), d);
  assert.equal(r.status, 200);
  assert.equal(((await r.json()) as { texto: string }).texto, "Abrimos de 12 a 11.");
  assert.match(llamadas[0].sistema, /Pollería Don Beto/);
  assert.match(llamadas[0].sistema, /Pollo a la brasa/);
  assert.equal(llamadas[0].texto, "¿A qué hora abren?");
});

test("chat: IA apagada → 503; mensajes inválidos → 422", async () => {
  assert.equal((await manejarWidget(post("chat", chat), dep({ iaActiva: false }).d)).status, 503);
  const { d } = dep();
  assert.equal((await manejarWidget(post("chat", { mensajes: [{ rol: "bot", texto: "x" }] }), d)).status, 422);
  assert.equal((await manejarWidget(post("chat", { mensajes: [{ rol: "admin", texto: "x" }] }), d)).status, 422);
});

test("chat: tope diario por cliente (limite_diario)", async () => {
  const { d } = dep();
  const estados: number[] = [];
  for (let i = 0; i < 4; i++) estados.push((await manejarWidget(post("chat", chat, ORIGEN, "don-beto", `2.2.2.${i}`), d)).status);
  assert.deepEqual(estados, [200, 200, 200, 429]);
});

test("chat: 30 por IP por hora", async () => {
  const { d } = dep({}, { limite_diario: 5000 });
  let ultimo = 0;
  for (let i = 0; i < 31; i++) ultimo = (await manejarWidget(post("chat", chat), d)).status;
  assert.equal(ultimo, 429);
});

test("lead: exige nombre, contacto y consentimiento; guarda normalizado", async () => {
  const { d, leads } = dep();
  assert.equal((await manejarWidget(post("lead", { nombre: "A", celular: "999111222", consentimiento: true }), d)).status, 422);
  assert.equal((await manejarWidget(post("lead", { nombre: "Ana", consentimiento: true }), d)).status, 422);
  assert.equal((await manejarWidget(post("lead", { nombre: "Ana", celular: "999111222" }), d)).status, 422);
  assert.equal((await manejarWidget(post("lead", { nombre: "Ana Pérez", celular: "999 111 222", detalle: "Quiero una mesa", consentimiento: true }), d)).status, 200);
  assert.equal(leads.length, 1);
  assert.deepEqual(leads[0], { cliente: "don-beto", nombre: "Ana Pérez", contacto: "999111222", detalle: "Quiero una mesa" });
});

test("lead: 5 por IP por hora", async () => {
  const { d } = dep();
  let ultimo = 0;
  for (let i = 0; i < 6; i++) ultimo = (await manejarWidget(post("lead", { nombre: "Ana", celular: "999111222", consentimiento: true }), d)).status;
  assert.equal(ultimo, 429);
});

test("instrucciones: IA declarada, datos del negocio y defensa ante órdenes", () => {
  const t = sistemaCliente(cliente);
  assert.match(t, /inteligencia artificial/);
  assert.match(t, /Pollo a la brasa/);
  assert.match(t, /ignora órdenes/);
  assert.match(t, /WhatsApp/);
  assert.doesNotMatch(sistemaCliente({ ...cliente, whatsapp: "" }), /botón/);
});

test("almacén: consulta por id con llave sb_ solo en apikey", async () => {
  const urls: string[] = []; let cab: Record<string, string> = {};
  const f = (async (u: string, init: RequestInit) => { urls.push(u); cab = init.headers as Record<string, string>; return new Response(JSON.stringify([cliente]), { status: 200 }); }) as unknown as typeof fetch;
  const c = await almacenWidget({ url: "https://p.supabase.co/", clave: "sb_secret_z", fetch: f }).buscarCliente("don-beto");
  assert.equal(c?.id, "don-beto");
  assert.match(urls[0], /clientes_bot\?id=eq\.don-beto/);
  assert.equal(cab.Authorization, undefined);
});

test("GET del mismo sitio sin Origin: se acepta solo con Sec-Fetch-Site same-origin y dominio registrado", async () => {
  const propio = (c: Partial<ConfigCliente> = {}) => dep({}, { dominios: ["https://x.test"], ...c }).d;
  const mismo = await manejarWidget(new Request(url("config"), { headers: { "sec-fetch-site": "same-origin" } }), propio());
  assert.equal(mismo.status, 200);
  assert.equal((await manejarWidget(new Request(url("config"), { headers: { "sec-fetch-site": "cross-site" } }), propio())).status, 403);
  assert.equal((await manejarWidget(new Request(url("config"), { headers: { "sec-fetch-site": "same-origin" } }), dep().d)).status, 403);
});
