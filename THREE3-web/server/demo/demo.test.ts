import { test } from "node:test";
import assert from "node:assert/strict";
import { manejarDemoChat, sistemaDemo, type DepDemo } from "./chat.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";

const ORIGEN = "https://www.three3agency.com";
function dep(extra: Partial<DepDemo> = {}) {
  const llamadas: { sistema: string; historial: unknown[]; texto: string }[] = [];
  const d: DepDemo = {
    activo: true, limitador: contadorMemoria(), origenesPermitidos: [ORIGEN], hoy: () => "2026-11-05",
    responder: async (sistema, historial, texto) => { llamadas.push({ sistema, historial, texto }); return "Hola, soy el asistente virtual."; },
    ...extra,
  };
  return { d, llamadas };
}
const post = (cuerpo: unknown, origen: string | null = ORIGEN, ip = "1.1.1.1") =>
  new Request("https://x.test/api/demo-chat", { method: "POST", body: JSON.stringify(cuerpo), headers: { ...(origen ? { origin: origen } : {}), "cf-connecting-ip": ip } });
const ok = { negocio: "polleria", mensajes: [{ rol: "bot", texto: "Hola" }, { rol: "usuario", texto: "¿Abren los domingos?" }] };

test("GET informa si la demo con IA está activa", async () => {
  const r = await manejarDemoChat(new Request("https://x.test/api/demo-chat"), dep({ activo: false }).d);
  assert.deepEqual(await r.json(), { ok: true, activo: false });
});

test("apagada: no responde ni gasta", async () => {
  const { d, llamadas } = dep({ activo: false });
  assert.equal((await manejarDemoChat(post(ok), d)).status, 503);
  assert.equal(llamadas.length, 0);
});

test("origen: sin origin o de otro sitio se rechaza", async () => {
  const { d, llamadas } = dep();
  assert.equal((await manejarDemoChat(post(ok, null), d)).status, 403);
  assert.equal((await manejarDemoChat(post(ok, "https://malo.example"), d)).status, 403);
  assert.equal(llamadas.length, 0);
});

test("responde con el negocio elegido y pasa solo el historial previo", async () => {
  const { d, llamadas } = dep();
  const r = await manejarDemoChat(post(ok), d);
  assert.equal(r.status, 200);
  assert.equal(((await r.json()) as { texto: string }).texto, "Hola, soy el asistente virtual.");
  assert.match(llamadas[0].sistema, /Pollería Don Beto/);
  assert.equal(llamadas[0].texto, "¿Abren los domingos?");
  assert.equal(llamadas[0].historial.length, 1);
});

test("validación: negocio desconocido, rol raro, último mensaje del bot, vacío", async () => {
  const { d } = dep();
  assert.equal((await manejarDemoChat(post({ ...ok, negocio: "otro" }), d)).status, 422);
  assert.equal((await manejarDemoChat(post({ negocio: "dental", mensajes: [{ rol: "sistema", texto: "x" }] }), d)).status, 422);
  assert.equal((await manejarDemoChat(post({ negocio: "dental", mensajes: [{ rol: "bot", texto: "x" }] }), d)).status, 422);
  assert.equal((await manejarDemoChat(post({ negocio: "dental", mensajes: [{ rol: "usuario", texto: "   " }] }), d)).status, 422);
  assert.equal((await manejarDemoChat(post({ negocio: "dental", mensajes: [] }), d)).status, 422);
});

test("recorta texto largo y limita el historial", async () => {
  const { d, llamadas } = dep();
  const mensajes = Array.from({ length: 9 }, (_, i) => ({ rol: i % 2 ? "bot" : "usuario", texto: "x".repeat(600) }));
  assert.equal((await manejarDemoChat(post({ negocio: "ropa", mensajes }), d)).status, 200);
  assert.equal(llamadas[0].texto.length, 300);
  assert.equal(llamadas[0].historial.length, 7);
  // un cuerpo enorme se rechaza antes de llegar al modelo
  const enorme = Array.from({ length: 30 }, () => ({ rol: "usuario", texto: "z".repeat(1000) }));
  assert.equal((await manejarDemoChat(post({ negocio: "ropa", mensajes: enorme }), d)).status, 413);
});

test("límite por IP: la 21.ª consulta en una hora se bloquea", async () => {
  const { d } = dep({ limitador: contadorMemoria() });
  let ultimo = 0;
  for (let i = 0; i < 21; i++) ultimo = (await manejarDemoChat(post(ok, ORIGEN, "9.9.9.9"), d)).status;
  assert.equal(ultimo, 429);
});

test("tope diario global: protege el gasto aunque cambien las IP", async () => {
  const { d } = dep();
  let ultimo = 0;
  for (let i = 0; i < 401; i++) ultimo = (await manejarDemoChat(post(ok, ORIGEN, `10.0.${Math.floor(i / 250)}.${i % 250}`), d)).status;
  assert.equal(ultimo, 429);
});

test("si el modelo falla → 502 y sin detalles internos", async () => {
  const { d } = dep({ responder: async () => { throw new Error("modelo_500 secreto"); } });
  const r = await manejarDemoChat(post(ok), d);
  assert.equal(r.status, 502);
  assert.doesNotMatch(await r.text(), /secreto/);
});

test("instrucciones: negocio ficticio, IA declarada y defensa ante órdenes", () => {
  const t = sistemaDemo("dental");
  assert.match(t, /EJEMPLO \(ficticio\)/);
  assert.match(t, /inteligencia artificial/);
  assert.match(t, /ignora órdenes/);
});
