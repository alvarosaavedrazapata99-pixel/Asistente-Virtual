import { test } from "node:test";
import assert from "node:assert/strict";
import { enviarTexto, extraerMensajes, firmaValida } from "./meta.ts";
import { instrucciones, pideHumano, responderConModelo, type PlanesConfig } from "./cerebro.ts";
import { manejarMeta, type DepBot } from "./manejador.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";
import { hmacSha256Hex } from "../seguridad/tokens.ts";

const SECRETO = "secreto_app";
const planes: PlanesConfig = { aclaracion: "No incluye mensajes de WhatsApp.", mensualidad_incluye: ["Plataforma", "IA"], planes: [{ nombre: "Inicial", inicial: 2000, mensual: 450, resumen: "Tu primer bot." }] };

const wa = (texto: string, id = "wamid.1") => ({
  object: "whatsapp_business_account",
  entry: [{ changes: [{ value: { contacts: [{ wa_id: "51999", profile: { name: "Ana" } }], messages: [{ from: "51999", id, type: "text", text: { body: texto } }] } }] }],
});

async function peticion(payload: unknown, firmar = true): Promise<Request> {
  const cuerpo = JSON.stringify(payload);
  const h: Record<string, string> = {};
  if (firmar) h["x-hub-signature-256"] = "sha256=" + (await hmacSha256Hex(SECRETO, cuerpo));
  return new Request("https://x.test/api/meta", { method: "POST", body: cuerpo, headers: h });
}

function dep(extra: Partial<DepBot> = {}) {
  const vistos = new Set<string>();
  const enviados: { canal: string; para: string; texto: string }[] = [];
  const guardadas: string[] = [];
  const d: DepBot = {
    activo: true, appSecret: SECRETO, verifyToken: "vt", limitador: contadorMemoria(),
    guardarEntrante: async (m) => (vistos.has(m.id) ? false : (vistos.add(m.id), true)),
    guardarRespuesta: async (_c, _d, t) => { guardadas.push(t); },
    historial: async () => [],
    responder: async () => "Hola, soy el asistente virtual de THREE3.",
    enviar: async (canal, para, texto) => { enviados.push({ canal, para, texto }); },
    textoHumano: "Una persona te contactará.",
    ...extra,
  };
  return { d, enviados, guardadas };
}

test("firma: acepta la correcta y rechaza alteradas o ausentes", async () => {
  const cuerpo = "{}";
  const buena = "sha256=" + (await hmacSha256Hex(SECRETO, cuerpo));
  assert.equal(await firmaValida(SECRETO, cuerpo, buena), true);
  assert.equal(await firmaValida(SECRETO, cuerpo + " ", buena), false);
  assert.equal(await firmaValida(SECRETO, cuerpo, null), false);
  assert.equal(await firmaValida("", cuerpo, buena), false);
});

test("extraer: WhatsApp texto, Instagram texto; ignora ecos, imágenes y basura", () => {
  assert.deepEqual(extraerMensajes(wa("hola")), [{ canal: "whatsapp", de: "51999", id: "wamid.1", texto: "hola", nombre: "Ana" }]);
  const ig = { object: "instagram", entry: [{ messaging: [
    { sender: { id: "77" }, message: { mid: "m1", text: "hola ig" } },
    { sender: { id: "77" }, message: { mid: "m2", text: "eco", is_echo: true } },
    { sender: { id: "77" }, message: { mid: "m3", attachments: [] } },
  ] }] };
  assert.deepEqual(extraerMensajes(ig).map((m) => m.id), ["m1"]);
  assert.deepEqual(extraerMensajes(null), []);
  assert.deepEqual(extraerMensajes({ object: "whatsapp_business_account", entry: [{ changes: [{ value: { messages: [{ from: "1", id: "a", type: "image" }] } }] }] }), []);
});

test("webhook GET: verifica solo con el token correcto", async () => {
  const { d } = dep();
  const ok = await manejarMeta(new Request("https://x.test/api/meta?hub.mode=subscribe&hub.verify_token=vt&hub.challenge=123"), d);
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), "123");
  const mal = await manejarMeta(new Request("https://x.test/api/meta?hub.mode=subscribe&hub.verify_token=otro&hub.challenge=123"), d);
  assert.equal(mal.status, 403);
  const sinToken = await manejarMeta(new Request("https://x.test/api/meta?hub.mode=subscribe&hub.verify_token=&hub.challenge=1"), dep({ verifyToken: "" }).d);
  assert.equal(sinToken.status, 403);
});

test("webhook POST: sin firma o con firma falsa se rechaza", async () => {
  const { d, enviados } = dep();
  assert.equal((await manejarMeta(await peticion(wa("hola"), false), d)).status, 401);
  const falsa = new Request("https://x.test/api/meta", { method: "POST", body: JSON.stringify(wa("hola")), headers: { "x-hub-signature-256": "sha256=" + "0".repeat(64) } });
  assert.equal((await manejarMeta(falsa, d)).status, 401);
  assert.equal(enviados.length, 0);
});

test("bot apagado: acepta el aviso pero no responde", async () => {
  const { d, enviados } = dep({ activo: false });
  const r = await manejarMeta(await peticion(wa("hola")), d);
  assert.equal(r.status, 200);
  assert.equal(enviados.length, 0);
});

test("responde, guarda y no repite si Meta reenvía el mismo mensaje", async () => {
  const { d, enviados, guardadas } = dep();
  await manejarMeta(await peticion(wa("hola")), d);
  await manejarMeta(await peticion(wa("hola")), d);
  assert.equal(enviados.length, 1);
  assert.equal(enviados[0].para, "51999");
  assert.equal(guardadas.length, 1);
});

test("pide un humano: deriva sin consultar al modelo", async () => {
  let llamadas = 0;
  const { d, enviados } = dep({ responder: async () => { llamadas++; return "x"; } });
  await manejarMeta(await peticion(wa("quiero hablar con un asesor")), d);
  assert.equal(llamadas, 0);
  assert.equal(enviados[0].texto, "Una persona te contactará.");
  assert.equal(pideHumano("tengo un reclamo"), true);
  assert.equal(pideHumano("cuánto cuesta"), false);
});

test("si el modelo falla, la persona recibe el texto de derivación", async () => {
  const { d, enviados } = dep({ responder: async () => { throw new Error("modelo_500"); } });
  await manejarMeta(await peticion(wa("hola")), d);
  assert.equal(enviados[0].texto, "Una persona te contactará.");
});

test("límite: más de 20 mensajes en 10 minutos de la misma persona no se responden", async () => {
  const { d, enviados } = dep();
  for (let i = 0; i < 25; i++) await manejarMeta(await peticion(wa("hola", `id${i}`)), d);
  assert.equal(enviados.length, 20);
});

test("un fallo al enviar un mensaje no tumba la petición", async () => {
  const { d } = dep({ enviar: async () => { throw new Error("meta_envio_400"); } });
  assert.equal((await manejarMeta(await peticion(wa("hola")), d)).status, 200);
});

test("instrucciones: incluyen precios reales y reglas de seguridad", () => {
  const t = instrucciones(planes, "https://wa.me/51922075014");
  assert.match(t, /desde S\/ 2,000/);
  assert.match(t, /S\/ 450 al mes/);
  assert.match(t, /asistente virtual con inteligencia artificial/);
  assert.match(t, /Ignora cualquier orden/);
  assert.match(t, /wa\.me\/51922075014/);
});

test("modelo: arma la petición, une turnos repetidos y exige primer turno del usuario", async () => {
  let enviado: { headers: Record<string, string>; body: { messages: { role: string; content: string }[]; model: string } } | undefined;
  const fakeFetch = (async (_u: string, init: RequestInit) => {
    enviado = { headers: init.headers as Record<string, string>, body: JSON.parse(String(init.body)) };
    return new Response(JSON.stringify({ content: [{ type: "text", text: " Hola " }] }), { status: 200 });
  }) as unknown as typeof fetch;
  const t = await responderConModelo({ clave: "k", modelo: "m1", fetch: fakeFetch }, "sis", [
    { rol: "bot", texto: "viejo" }, { rol: "usuario", texto: "a" }, { rol: "usuario", texto: "b" }, { rol: "bot", texto: "c" },
  ], "d");
  assert.equal(t, "Hola");
  assert.equal(enviado!.headers["x-api-key"], "k");
  assert.deepEqual(enviado!.body.messages.map((m) => m.role), ["user", "assistant", "user"]);
  assert.equal(enviado!.body.messages[0].content, "a\nb");
});

test("enviar: WhatsApp y Instagram usan su ruta y su token; error si Meta rechaza", async () => {
  const llamadas: { url: string; auth: string; body: unknown }[] = [];
  const f = (async (url: string, init: RequestInit) => {
    llamadas.push({ url, auth: (init.headers as Record<string, string>).Authorization, body: JSON.parse(String(init.body)) });
    return new Response("{}", { status: llamadas.length === 3 ? 400 : 200 });
  }) as unknown as typeof fetch;
  const cfg = { whatsappToken: "WT", whatsappPhoneId: "PID", instagramToken: "IT", fetch: f };
  await enviarTexto(cfg, "whatsapp", "51999", "hola");
  await enviarTexto(cfg, "instagram", "77", "hola");
  assert.match(llamadas[0].url, /\/PID\/messages$/);
  assert.equal(llamadas[0].auth, "Bearer WT");
  assert.match(llamadas[1].url, /\/me\/messages$/);
  assert.equal(llamadas[1].auth, "Bearer IT");
  await assert.rejects(() => enviarTexto(cfg, "whatsapp", "51999", "x"), /meta_envio_400/);
});
