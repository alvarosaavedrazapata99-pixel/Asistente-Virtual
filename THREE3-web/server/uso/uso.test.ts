import { test } from "node:test";
import assert from "node:assert/strict";
import COSTOS from "../../public/costos-core.js";
import { almacenResumenUso, manejarAdminUso, registrarUso } from "./uso.ts";
import { responderConModelo } from "../bot/cerebro.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";

test("costos: precio por millón de tokens (Haiku 5.5 y Sonnet 5.5)", () => {
  assert.equal(COSTOS.costoUSD("claude-haiku-5-5", 1_000_000, 0, 0), 0.1);
  assert.equal(COSTOS.costoUSD("claude-haiku-5-5", 0, 1_000_000, 0), 0.5);
  assert.equal(COSTOS.costoUSD("claude-sonnet-5-5", 1_000_000, 1_000_000, 0), 12);
  assert.equal(COSTOS.costoUSD("modelo-que-no-existe", 1, 1, 0), null);
});

test("costos: una conversación de 8 mensajes cuesta una fracción de centavo en Haiku y unos centavos en Sonnet", () => {
  const base = { sistema: 1000, turno: 70, pregunta: 40, respuesta: 220, msgs: 8 };
  const h = COSTOS.conversacion({ ...base, modelo: "claude-haiku-5-5" }) as { usd: number; tin: number; tout: number };
  const s = COSTOS.conversacion({ ...base, modelo: "claude-sonnet-5-5" }) as { usd: number };
  assert.ok(h.usd > 0.001 && h.usd < 0.004, `haiku ${h.usd}`);
  assert.ok(s.usd > 0.02 && s.usd < 0.08, `sonnet ${s.usd}`);
  assert.ok(Math.abs(s.usd / h.usd - 20) < 1, "Sonnet cuesta unas 20 veces más que Haiku");
  assert.equal(h.tout, 8 * 220);
  assert.ok(h.tin > 8 * 1000, "la entrada crece con el historial");
});

test("costos: margen por cliente y de toda la cartera", () => {
  const e = COSTOS.estimar({ modelo: "claude-haiku-5-5", sistema: 1000, turno: 70, pregunta: 40, respuesta: 220, msgs: 8, conversaciones: 300, clientes: 10, mensualidadPEN: 450, tc: 3.5, fijosUSD: 60 });
  assert.ok(e.porClienteUSD < 1, "menos de 1 dólar al mes por cliente");
  assert.ok(e.pctIA < 0.02, "la IA es menos del 2 % de la mensualidad");
  assert.ok(e.utilidadUSD > 1000, "con 10 clientes de S/ 450 queda utilidad");
  assert.equal(Math.round(e.ingresoUSD), Math.round((450 * 10) / 3.5));
});

test("modelo: pide poco pensamiento, margen de tokens y reporta el uso real", async () => {
  let cuerpo: Record<string, unknown> = {};
  const f = (async (_u: string, init: RequestInit) => { cuerpo = JSON.parse(String(init.body)); return new Response(JSON.stringify({ content: [{ type: "text", text: "Hola" }], usage: { input_tokens: 900, output_tokens: 150, cache_read_input_tokens: 0 } }), { status: 200 }); }) as unknown as typeof fetch;
  const usos: unknown[] = [];
  const t = await responderConModelo({ clave: "k", modelo: "claude-haiku-5-5", fetch: f, alUsar: (u) => { usos.push(u); } }, "sis", [], "hola");
  assert.equal(t, "Hola");
  assert.deepEqual(cuerpo["output_config"], { effort: "low" });
  assert.equal(cuerpo["max_tokens"], 1024);
  assert.deepEqual(usos, [{ entrada: 900, salida: 150, cache: 0 }]);
});

test("modelo: si medir el uso falla, la respuesta se entrega igual", async () => {
  const f = (async () => new Response(JSON.stringify({ content: [{ type: "text", text: "Hola" }], usage: { input_tokens: 1, output_tokens: 1 } }), { status: 200 })) as unknown as typeof fetch;
  const t = await responderConModelo({ clave: "k", modelo: "m", fetch: f, alUsar: () => { throw new Error("db caída"); } }, "s", [], "h");
  assert.equal(t, "Hola");
});

test("registrar uso: guarda origen, cliente y tokens con llave sb_ solo en apikey", async () => {
  const llamadas: { u: string; h: Record<string, string>; b: Record<string, unknown> }[] = [];
  const f = (async (u: string, init: RequestInit) => { llamadas.push({ u, h: init.headers as Record<string, string>, b: JSON.parse(String(init.body)) }); return new Response(null, { status: 201 }); }) as unknown as typeof fetch;
  await registrarUso({ url: "https://p.supabase.co/", clave: "sb_secret_x", fetch: f })("widget", "don-beto", "claude-haiku-5-5", { entrada: 900, salida: 150, cache: 0 });
  assert.match(llamadas[0].u, /\/rest\/v1\/uso_ia$/);
  assert.deepEqual(llamadas[0].b, { origen: "widget", cliente: "don-beto", modelo: "claude-haiku-5-5", tokens_in: 900, tokens_out: 150, tokens_cache: 0 });
  assert.equal(llamadas[0].h.Authorization, undefined);
});

test("admin uso: exige la clave y devuelve el resumen", async () => {
  const dep = { adminToken: "clave_larga_de_prueba", limitador: contadorMemoria(), resumen: async () => [{ cliente: "don-beto", origen: "widget", modelo: "claude-haiku-5-5", mes: "2026-11-01", llamadas: 10, tin: 9000, tout: 1500, tcache: 0 }] };
  const pet = (t?: string) => new Request("https://x.test/api/admin/uso", { headers: t ? { authorization: `Bearer ${t}` } : {} });
  assert.equal((await manejarAdminUso(pet(), dep)).status, 401);
  assert.equal((await manejarAdminUso(pet("otra"), dep)).status, 401);
  const r = await manejarAdminUso(pet("clave_larga_de_prueba"), dep);
  assert.equal(r.status, 200);
  assert.equal(((await r.json()) as { filas: unknown[] }).filas.length, 1);
  const f = (async (u: string) => { assert.match(u, /uso_ia_mensual/); return new Response("[]", { status: 200 }); }) as unknown as typeof fetch;
  await almacenResumenUso({ url: "https://p.supabase.co", clave: "k", fetch: f }).resumen();
});
