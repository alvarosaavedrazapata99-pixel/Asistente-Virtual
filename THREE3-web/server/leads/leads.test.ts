import { test } from "node:test";
import assert from "node:assert/strict";
import { manejarLead, type DepLeads } from "./registrar.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";
import { verificarTurnstile } from "../seguridad/turnstile.ts";

const turnstileOk = (async () => new Response(JSON.stringify({ success: true }))) as unknown as typeof fetch;
const turnstileNo = (async () => new Response(JSON.stringify({ success: false }))) as unknown as typeof fetch;

function dep(over: Partial<DepLeads> = {}) {
  const guardados: Record<string, unknown>[] = [];
  const d: DepLeads = {
    registrar: async (p) => { guardados.push(p); return { estado: "creado" }; },
    limitador: contadorMemoria(),
    turnstile: { secreto: "s", entorno: "produccion", fetch: turnstileOk },
    ...over,
  };
  return { d, guardados };
}
const buenos = { nombre: "  Ana   Pérez ", email: " ANA@Correo.COM ", servicio_id: "crm", consentimiento: true, turnstile: "tok", utm_campaign: "link-bio", idempotency_key: "k1" };
const post = (cuerpo: unknown, ip = "1.1.1.1") => new Request("https://three3.test/api/leads", { method: "POST", body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo), headers: { "CF-Connecting-IP": ip } });

test("lead válido: se normaliza y se guarda sin el token ni el campo trampa", async () => {
  const { d, guardados } = dep();
  const r = await manejarLead(post(buenos), d);
  assert.equal(r.status, 200);
  assert.equal(guardados[0].nombre, "Ana Pérez");
  assert.equal(guardados[0].email_norm, "ana@correo.com");
  assert.equal("turnstile" in guardados[0], false);
});

test("celular peruano e internacional se aceptan; uno ambiguo se rechaza", async () => {
  const { d, guardados } = dep();
  await manejarLead(post({ ...buenos, email: "", celular: "+51 987 654 321" }), d);
  await manejarLead(post({ ...buenos, email: "", celular: "+34 612 345 678" }, "2.2.2.2"), d);
  assert.equal(guardados[0].celular_norm, "987654321");
  assert.equal(guardados[1].celular_norm, "+34612345678");
  assert.equal((await manejarLead(post({ ...buenos, email: "", celular: "612345678" }, "3.3.3.3"), d)).status, 422);
});

test("Turnstile falla: 403 y no se guarda nada", async () => {
  const { d, guardados } = dep({ turnstile: { secreto: "s", entorno: "produccion", fetch: turnstileNo } });
  assert.equal((await manejarLead(post(buenos), d)).status, 403);
  assert.equal(guardados.length, 0);
});

test("campo trampa: responde bien pero no guarda", async () => {
  const { d, guardados } = dep();
  const r = await manejarLead(post({ ...buenos, web_url_trampa: "http://spam" }), d);
  assert.equal(r.status, 200);
  assert.equal(guardados.length, 0);
});

test("límite por IP: el envío 9 en 10 minutos recibe 429; otra IP no se afecta", async () => {
  const { d } = dep();
  const estados: number[] = [];
  for (let i = 0; i < 9; i++) estados.push((await manejarLead(post({ ...buenos, idempotency_key: `k${i}` }), d)).status);
  assert.equal(estados[7], 200);
  assert.equal(estados[8], 429);
  assert.equal((await manejarLead(post(buenos, "8.8.8.8"), d)).status, 200);
});

test("entradas inválidas", async () => {
  const { d } = dep();
  const casos: [unknown, number][] = [
    [{ ...buenos, nombre: "A" }, 422],
    [{ ...buenos, email: "", celular: "" }, 422],
    [{ ...buenos, servicio_id: "hack" }, 422],
    [{ ...buenos, consentimiento: false }, 422],
    ["{no es json", 400],
    ["x".repeat(20000), 413],
  ];
  let ip = 10;
  for (const [cuerpo, esperado] of casos) assert.equal((await manejarLead(post(cuerpo, `4.4.4.${ip++}`), d)).status, esperado, JSON.stringify(cuerpo).slice(0, 40));
});

test("falla de la base de datos: 502 y mensaje genérico", async () => {
  const { d } = dep({ registrar: async () => { throw new Error("detalle interno secreto"); } });
  const r = await manejarLead(post(buenos), d);
  assert.equal(r.status, 502);
  assert.equal((await r.text()).includes("secreto"), false);
});

test("metodo GET no permitido", async () => {
  const { d } = dep();
  assert.equal((await manejarLead(new Request("https://x.test/api/leads"), d)).status, 405);
});

test("Turnstile: sin clave se permite solo fuera de producción; error de red falla cerrado", async () => {
  assert.equal(await verificarTurnstile({ secreto: "", token: "", entorno: "desarrollo" }), true);
  assert.equal(await verificarTurnstile({ secreto: "", token: "", entorno: "produccion" }), false);
  assert.equal(await verificarTurnstile({ secreto: "s", token: "", entorno: "produccion", fetch: turnstileOk }), false);
  const roto = (async () => { throw new Error("red"); }) as unknown as typeof fetch;
  assert.equal(await verificarTurnstile({ secreto: "s", token: "t", entorno: "produccion", fetch: roto }), false);
  assert.equal(await verificarTurnstile({ secreto: "s", token: "t", entorno: "produccion", fetch: turnstileOk }), true);
});

test("contador: la ventana se reinicia", async () => {
  let t = 0;
  const c = contadorMemoria(() => t);
  assert.equal(await c.incrementar("a", 10), 1);
  assert.equal(await c.incrementar("a", 10), 2);
  t = 11_000;
  assert.equal(await c.incrementar("a", 10), 1);
});
