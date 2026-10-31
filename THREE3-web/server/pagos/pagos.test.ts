import { test } from "node:test";
import assert from "node:assert/strict";
import { almacenMemoria } from "./almacen-memoria.ts";
import { almacenSupabase } from "./almacen-supabase.ts";
import { crearPreferencia, verificarFirma, type ConfigMP } from "./mercadopago.ts";
import { validarTransicion, puedePasar } from "./estados.ts";
import { procesarAviso } from "./webhook.ts";
import { hmacSha256Hex, nuevoToken, tokenValido } from "../seguridad/tokens.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";
import { manejarConsulta, manejarCrear, manejarCrearOrden, manejarWebhook, type DepPagos } from "./manejadores.ts";

const SECRETO = "secreto-de-prueba";
const AHORA = 1_800_000_000_000;
const MP: ConfigMP = { accessToken: "TEST-token", webhookSecret: SECRETO, siteUrl: "https://three3.test" };

async function firmar(dataId: string, requestId = "req-1", ts = Math.floor(AHORA / 1000), secreto = SECRETO) {
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  return { "x-signature": `ts=${ts},v1=${await hmacSha256Hex(secreto, manifest)}`, "x-request-id": requestId };
}
type Pago = { id: string; status: string; transaction_amount: number; currency_id: string; external_reference: string; payment_method_id: string };
const fetchMP = (pago: Pago | null, estado = 200): typeof fetch => (async () => new Response(pago ? JSON.stringify(pago) : "{}", { status: estado })) as typeof fetch;

async function escenario(monto = 2500) {
  const almacen = almacenMemoria();
  const { token, hash } = await nuevoToken();
  const orden = await almacen.crearOrden({ token_hash: hash, servicio_id: "crm", descripcion: "CRM", monto_pen: monto });
  const pago = (o: Partial<Pago> = {}): Pago => ({ id: "111", status: "approved", transaction_amount: monto, currency_id: "PEN", external_reference: orden.id, payment_method_id: "visa", ...o });
  const aviso = async (p: Pago, hdr?: Record<string, string>, f?: typeof fetch) => {
    const url = new URL(`https://three3.test/api/pagos/webhook?data.id=${p.id}&type=payment`);
    const h = new Headers(hdr ?? (await firmar(p.id)));
    return procesarAviso({ almacen, mp: MP, fetch: f ?? fetchMP(p), ahora: () => AHORA }, url, h, {});
  };
  return { almacen, orden, token, pago, aviso };
}

test("estados: solo transiciones permitidas", () => {
  assert.ok(puedePasar("creado", "pagado"));
  assert.ok(!puedePasar("creado", "entregado"), "no se salta el pago");
  assert.ok(!puedePasar("cerrado", "pagado"));
  assert.throws(() => validarTransicion("fallido", "pagado"));
});

test("firma: válida, secreto distinto, dato alterado, vencida, sin cabecera y formato roto", async () => {
  const h = await firmar("999");
  const base = { secreto: SECRETO, cabeceraFirma: h["x-signature"], requestId: "req-1", dataId: "999", ahoraMs: AHORA };
  assert.equal((await verificarFirma(base)).valida, true);
  assert.equal((await verificarFirma({ ...base, secreto: "otro" })).valida, false);
  assert.equal((await verificarFirma({ ...base, dataId: "1000" })).valida, false);
  assert.equal((await verificarFirma({ ...base, ahoraMs: AHORA + 3_600_000 })).motivo, "fuera_de_ventana");
  assert.equal((await verificarFirma({ ...base, cabeceraFirma: null })).motivo, "sin_cabecera");
  assert.equal((await verificarFirma({ ...base, cabeceraFirma: "basura" })).motivo, "formato");
  assert.equal((await verificarFirma({ ...base, secreto: "" })).motivo, "sin_secreto");
});

test("aviso aprobado marca la orden como pagada y registra el pago", async () => {
  const e = await escenario();
  const r = await e.aviso(e.pago());
  assert.deepEqual(r, { status: 200, accion: "pagado" });
  assert.equal(e.almacen.ordenes.get(e.orden.id)?.estado, "pagado");
  assert.equal(e.almacen.pagos.length, 1);
});

test("aviso repetido no cambia nada (idempotencia)", async () => {
  const e = await escenario();
  await e.aviso(e.pago());
  const r2 = await e.aviso(e.pago());
  assert.equal(r2.accion, "duplicado");
  assert.equal(e.almacen.historial.length, 1);
});

test("firma inválida: 401 y la orden no se toca", async () => {
  const e = await escenario();
  const r = await e.aviso(e.pago(), await firmar("111", "req-1", Math.floor(AHORA / 1000), "secreto-falso"));
  assert.equal(r.status, 401);
  assert.equal(e.almacen.ordenes.get(e.orden.id)?.estado, "creado");
  assert.equal(e.almacen.anomalias[0].tipo, "firma_invalida");
});

test("monto o moneda distintos: no se marca pagado y queda anomalía", async () => {
  const e = await escenario(2500);
  assert.equal((await e.aviso(e.pago({ transaction_amount: 1 }))).accion, "monto_invalido");
  assert.equal((await e.aviso(e.pago({ id: "112", currency_id: "USD" }))).accion, "monto_invalido");
  assert.equal(e.almacen.ordenes.get(e.orden.id)?.estado, "creado");
  assert.equal(e.almacen.anomalias.filter((a) => a.tipo === "monto_o_moneda").length, 2);
});

test("pago de una orden que no existe se ignora con 200 y se registra", async () => {
  const e = await escenario();
  const r = await e.aviso(e.pago({ external_reference: "ord_inexistente_123" }));
  assert.deepEqual(r, { status: 200, accion: "orden_desconocida" });
});

test("segundo pago aprobado para una orden ya pagada: anomalía para devolver", async () => {
  const e = await escenario();
  await e.aviso(e.pago({ id: "111" }));
  const r = await e.aviso(e.pago({ id: "222" }));
  assert.equal(r.accion, "pago_adicional");
  assert.equal(e.almacen.anomalias.some((a) => a.tipo === "pago_adicional"), true);
});

test("rechazado deja la orden abierta; reembolso la pasa a reembolsado", async () => {
  const e = await escenario();
  assert.equal((await e.aviso(e.pago({ id: "5", status: "rejected" }))).accion, "registrado");
  assert.equal(e.almacen.ordenes.get(e.orden.id)?.estado, "creado");
  await e.aviso(e.pago({ id: "6", status: "approved" }));
  assert.equal((await e.aviso(e.pago({ id: "6", status: "refunded" }))).accion, "reembolsado");
  assert.equal(e.almacen.ordenes.get(e.orden.id)?.estado, "reembolsado");
});

test("si Mercado Pago no responde: 502 para que reintente", async () => {
  const e = await escenario();
  assert.equal((await e.aviso(e.pago(), undefined, fetchMP(null, 500))).status, 502);
});

test("avisos concurrentes del mismo pago marcan una sola vez", async () => {
  const e = await escenario();
  const rs = await Promise.all(Array.from({ length: 10 }, () => e.aviso(e.pago())));
  assert.equal(rs.filter((r) => r.accion === "pagado").length, 1);
  assert.equal(e.almacen.historial.length, 1);
});

test("preferencia: monto del servidor, PEN, referencia y firma de idempotencia; rechaza montos absurdos", async () => {
  const e = await escenario(2500);
  let visto: { url: string; init: RequestInit } | undefined;
  const f = (async (url: string, init: RequestInit) => { visto = { url, init }; return new Response(JSON.stringify({ id: "pref1", init_point: "https://mp.test/pagar" })); }) as unknown as typeof fetch;
  const pref = await crearPreferencia(MP, e.orden, e.token, f);
  assert.equal(pref.init_point, "https://mp.test/pagar");
  const cuerpo = JSON.parse(String(visto?.init.body));
  assert.equal(cuerpo.items[0].unit_price, 2500);
  assert.equal(cuerpo.items[0].currency_id, "PEN");
  assert.equal(cuerpo.external_reference, e.orden.id);
  assert.match(cuerpo.notification_url, /\/api\/pagos\/webhook$/);
  assert.equal((visto?.init.headers as Record<string, string>)["Authorization"], "Bearer TEST-token");
  await assert.rejects(() => crearPreferencia(MP, { ...e.orden, monto_pen: -5 }, e.token, f), /monto_invalido/);
  await assert.rejects(() => crearPreferencia(MP, { ...e.orden, monto_pen: 1e9 }, e.token, f), /monto_invalido/);
});

test("tokens: el correcto pasa, el alterado y el vacío no", async () => {
  const { token, hash } = await nuevoToken();
  assert.equal(await tokenValido(token, hash), true);
  assert.equal(await tokenValido(token + "x", hash), false);
  assert.equal(await tokenValido("", hash), false);
});

async function depHandlers(over: Partial<DepPagos> = {}) {
  const almacen = almacenMemoria();
  const dep: DepPagos = { almacen, mp: MP, limitador: contadorMemoria(), adminToken: "admin-secreto", fetch: (async () => new Response(JSON.stringify({ id: "p", init_point: "https://mp.test/pagar" }))) as unknown as typeof fetch, ...over };
  return { almacen, dep };
}
const post = (url: string, cuerpo: unknown, headers: Record<string, string> = {}) => new Request(url, { method: "POST", body: JSON.stringify(cuerpo), headers: { "content-type": "text/plain", "CF-Connecting-IP": "1.1.1.1", ...headers } });

test("admin: sin clave 401; con clave crea orden y devuelve enlace; validaciones", async () => {
  const { dep } = await depHandlers();
  const cuerpo = { servicio_id: "crm", monto_pen: 2500, descripcion: "CRM para Café Luna" };
  assert.equal((await manejarCrearOrden(post("https://x.test/a", cuerpo), dep, "https://three3.test")).status, 401);
  assert.equal((await manejarCrearOrden(post("https://x.test/a", cuerpo, { authorization: "Bearer mala" }), dep, "https://three3.test")).status, 401);
  const ok = await manejarCrearOrden(post("https://x.test/a", cuerpo, { authorization: "Bearer admin-secreto" }), dep, "https://three3.test");
  assert.equal(ok.status, 201);
  const j = (await ok.json()) as { enlace: string; token: string };
  assert.match(j.enlace, /^https:\/\/three3\.test\/pagar\?o=ord_/);
  for (const malo of [{ ...cuerpo, monto_pen: 0 }, { ...cuerpo, monto_pen: 1e7 }, { ...cuerpo, servicio_id: "hack" }, { ...cuerpo, descripcion: "" }]) {
    assert.equal((await manejarCrearOrden(post("https://x.test/a", malo, { authorization: "Bearer admin-secreto" }), dep, "https://three3.test")).status, 422);
  }
});

test("consulta y creación de pago: el monto sale del servidor y un token malo no distingue de una orden inexistente", async () => {
  const { dep } = await depHandlers();
  const ord = await (await manejarCrearOrden(post("https://x.test/a", { servicio_id: "crm", monto_pen: 2500, descripcion: "CRM" }, { authorization: "Bearer admin-secreto" }), dep, "https://three3.test")).json() as { id: string; token: string };
  const consulta = (o: string, t: string) => manejarConsulta(new Request(`https://x.test/api/pagos/orden?o=${o}&t=${t}`, { headers: { "CF-Connecting-IP": "2.2.2.2" } }), dep);
  const buena = await consulta(ord.id, ord.token);
  assert.equal(buena.status, 200);
  assert.equal(((await buena.json()) as { monto_pen: number }).monto_pen, 2500);
  const mala = await consulta(ord.id, "token-falso");
  const inexistente = await consulta("ord_noexiste1234", ord.token);
  assert.equal(mala.status, 404);
  assert.equal(inexistente.status, 404);
  assert.deepEqual(await mala.json(), await inexistente.json());
  // el cliente intenta imponer un monto: se ignora
  const crear = await manejarCrear(post("https://x.test/c", { o: ord.id, t: ord.token, monto_pen: 1 }), dep);
  assert.equal(crear.status, 200);
  assert.equal(((await crear.json()) as { url: string }).url, "https://mp.test/pagar");
});

test("crear pago: 409 si la orden ya no está abierta y 429 al abusar", async () => {
  const { dep, almacen } = await depHandlers();
  const ord = await (await manejarCrearOrden(post("https://x.test/a", { servicio_id: "crm", monto_pen: 100, descripcion: "CRM" }, { authorization: "Bearer admin-secreto" }), dep, "https://three3.test")).json() as { id: string; token: string };
  await almacen.cambiarEstado(ord.id, "creado", "pagado", "prueba");
  assert.equal((await manejarCrear(post("https://x.test/c", { o: ord.id, t: ord.token }), dep)).status, 409);
  let ultimo = 200;
  for (let i = 0; i < 12; i++) ultimo = (await manejarCrear(post("https://x.test/c", { o: ord.id, t: ord.token }, { "CF-Connecting-IP": "9.9.9.9" }), dep)).status;
  assert.equal(ultimo, 429);
});

test("webhook por HTTP: firma mala 401, firma buena marca pagado", async () => {
  const e = await escenario();
  const f = fetchMP(e.pago());
  const dep: DepPagos = { almacen: e.almacen, mp: MP, limitador: contadorMemoria(), adminToken: "x", fetch: f };
  const url = "https://three3.test/api/pagos/webhook?data.id=111&type=payment";
  const mala = await manejarWebhook(new Request(url, { method: "POST", body: "{}", headers: { "x-signature": "ts=1,v1=" + "0".repeat(64), "x-request-id": "r" } }), dep);
  assert.equal(mala.status, 401);
  const h = await firmar("111", "req-9", Math.floor(Date.now() / 1000));
  const buena = await manejarWebhook(new Request(url, { method: "POST", body: "{}", headers: h }), dep);
  assert.equal(buena.status, 200);
  assert.equal(e.almacen.ordenes.get(e.orden.id)?.estado, "pagado");
});

test("almacén Supabase: cabeceras, rutas y detección de repetidos", async () => {
  const llamadas: { url: string; init: RequestInit }[] = [];
  const respuestas: unknown[] = [[], [{ id: "ord_1" }]];
  const f = (async (url: string, init: RequestInit) => { llamadas.push({ url, init }); return new Response(JSON.stringify(respuestas.shift() ?? [])); }) as unknown as typeof fetch;
  const a = almacenSupabase({ url: "https://p.supabase.co/", claveServicio: "SERVICIO", fetch: f });
  assert.equal(await a.registrarEvento("mercadopago", "1:approved", {}), false, "vacío = ya existía");
  assert.equal(await a.cambiarEstado("ord_1", "creado", "pagado", "t"), true);
  assert.match(llamadas[0].url, /^https:\/\/p\.supabase\.co\/rest\/v1\/webhook_eventos$/);
  assert.equal((llamadas[0].init.headers as Record<string, string>)["Prefer"], "resolution=ignore-duplicates,return=representation");
  assert.equal((llamadas[0].init.headers as Record<string, string>)["apikey"], "SERVICIO");
  assert.match(llamadas[1].url, /ordenes\?id=eq\.ord_1&estado=eq\.creado$/);
});
