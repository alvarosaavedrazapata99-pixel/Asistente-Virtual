import { test } from "node:test";
import assert from "node:assert/strict";
import DIAG from "../../public/diagnostico-core.js";
import { manejarDiagnostico, type DepDiagnostico } from "./registrar.ts";
import { correoAviso, correoCliente, enviarCorreo } from "./correo.ts";
import { manejarAdminDiagnosticos, type DepAdminDiag } from "./admin.ts";
import { contadorMemoria } from "../seguridad/limitador.ts";

const bien = { canales: ["whatsapp", "instagram"], consultas: "c3", respuesta: "r3", fuera: "f3", registro: "g4", atiende: "a1", dolores: ["x0", "x2"], meta: "m1", urgencia: "u1", inversion: "i3", decide: "d1" };
const fria = { ...bien, consultas: "c1", respuesta: "r1", fuera: "f1", registro: "g1", atiende: "a3", urgencia: "u3", inversion: "i1", decide: "d3", canales: ["presencial"] };

test("núcleo: hay 30 rubros con 4 problemas típicos y las preguntas comunes", () => {
  assert.equal(DIAG.RUBROS.length, 30);
  for (const r of DIAG.RUBROS) assert.equal(r.dolores.length, 4);
  assert.ok(DIAG.rubro("tiendavirtual"));
  assert.equal(DIAG.PREGUNTAS.length, 11);
});

test("validación: acepta respuestas completas y rechaza opciones inventadas, faltantes o repetidas", () => {
  assert.equal(DIAG.validar("restaurante", bien), null);
  assert.equal(DIAG.validar("nada", bien), "rubro");
  assert.equal(DIAG.validar("restaurante", { ...bien, consultas: "c9" }), "consultas");
  assert.equal(DIAG.validar("restaurante", { ...bien, canales: [] }), "canales");
  assert.equal(DIAG.validar("restaurante", { ...bien, dolores: ["x0", "x0"] }), "dolores");
  assert.equal(DIAG.validar("restaurante", { ...bien, dolores: ["x0", "x1", "x2", "x3"] }), "dolores");
  assert.equal(DIAG.validar("restaurante", { ...bien, dolores: ["x9"] }), "dolores");
  const { meta, ...sin } = bien; void meta;
  assert.equal(DIAG.validar("restaurante", sin), "meta");
  assert.equal(DIAG.validar("restaurante", null), "respuestas");
});

test("evaluación: caliente con mala atención; fría con buena atención y sin urgencia", () => {
  const a = DIAG.evaluar("restaurante", bien);
  assert.equal(a.interes.nivel, "muy");
  assert.ok(a.madurez < 30, "madurez baja");
  assert.ok(a.perdidas > 0 && a.perdidaPct >= 3 && a.perdidaPct <= 40);
  assert.equal(a.ganancias.length, 3);
  assert.equal(a.modulo, true);
  const b = DIAG.evaluar("restaurante", fria);
  assert.equal(b.interes.nivel, "explorando");
  assert.ok(b.madurez > 70);
  assert.equal(b.plan, "plan-inicial");
});

test("plan: crece con el volumen, los canales y el rubro empresarial", () => {
  const grande = DIAG.evaluar("logistica", { ...bien, consultas: "c4", canales: ["whatsapp", "web", "instagram"], atiende: "a3", meta: "m3" });
  assert.equal(grande.plan, "plan-avanzado");
  assert.equal(DIAG.evaluar("restaurante", { ...bien, consultas: "c2", canales: ["whatsapp"], meta: "m1", atiende: "a1" }).plan, "plan-inicial");
});

const req = (cuerpo: unknown, ip = "1.1.1.1") => new Request("https://x.test/api/diagnostico", { method: "POST", body: JSON.stringify(cuerpo), headers: { "cf-connecting-ip": ip } });
const base = { rubro: "restaurante", respuestas: bien, nombre: "Ana Pérez", negocio: "Mi local", celular: "999 111 222", email: "ANA@Correo.PE", consentimiento: true, idempotency_key: "k1" };
function dep(extra: Partial<DepDiagnostico> = {}) {
  const reg: Record<string, unknown>[] = [], guardados: unknown[] = [], avisos: unknown[] = [];
  const d: DepDiagnostico = {
    limitador: contadorMemoria(), turnstile: { secreto: "", entorno: "desarrollo" },
    registrarContacto: async (p) => { reg.push(p); return { estado: "creado", contacto_id: 7 }; },
    guardar: async (x) => { guardados.push(x); },
    notificar: async (r, c) => { avisos.push([r.interes.nivel, c.email]); return { cliente: true, aviso: true }; },
    ...extra,
  };
  return { d, reg, guardados, avisos };
}

test("API: registra, recalcula en el servidor, guarda, notifica y devuelve el resultado", async () => {
  const { d, reg, guardados, avisos } = dep();
  const r = await manejarDiagnostico(req({ ...base, resultado: { interes: { nivel: "explorando" }, madurez: 100 } }), d);
  assert.equal(r.status, 200);
  const j = (await r.json()) as { resultado: { interes: { nivel: string }; madurez: number }; correo_enviado: boolean };
  assert.equal(j.resultado.interes.nivel, "muy"); // ignora lo que mande el navegador
  assert.ok(j.resultado.madurez < 30);
  assert.equal(j.correo_enviado, true);
  assert.equal(reg[0]["email_norm"], "ana@correo.pe");
  assert.equal(reg[0]["servicio_id"], "diagnostico");
  assert.equal((guardados[0] as { contacto_id: number }).contacto_id, 7);
  assert.deepEqual(avisos[0], ["muy", "ana@correo.pe"]);
});

test("API: validaciones (nombre, contacto, consentimiento, respuestas) y trampa de bots", async () => {
  const { d, reg } = dep();
  assert.equal((await manejarDiagnostico(req({ ...base, nombre: "A" }), d)).status, 422);
  assert.equal((await manejarDiagnostico(req({ ...base, email: "", celular: "" }), d)).status, 422);
  assert.equal((await manejarDiagnostico(req({ ...base, consentimiento: false }), d)).status, 422);
  assert.equal((await manejarDiagnostico(req({ ...base, respuestas: { ...bien, consultas: "zzz" } }), d)).status, 422);
  assert.equal((await manejarDiagnostico(req({ ...base, rubro: "inventado" }), d)).status, 422);
  assert.equal((await manejarDiagnostico(req({ ...base, web_url_trampa: "x" }), d)).status, 200);
  assert.equal(reg.length, 0);
});

test("API: Turnstile obligatorio en producción, límite por IP y fallo de base → 502", async () => {
  const prod = dep({ turnstile: { secreto: "s", entorno: "produccion" } }).d;
  assert.equal((await manejarDiagnostico(req(base), prod)).status, 403);
  const { d } = dep();
  let ult = 0;
  for (let i = 0; i < 7; i++) ult = (await manejarDiagnostico(req({ ...base, idempotency_key: "z" + i }, "9.9.9.9"), d)).status;
  assert.equal(ult, 429);
  assert.equal((await manejarDiagnostico(req(base), dep({ guardar: async () => { throw new Error("x"); } }).d)).status, 502);
});

test("API: si falla el correo el visitante igual recibe su resultado", async () => {
  const { d } = dep({ notificar: async () => { throw new Error("resend_500"); } });
  const r = await manejarDiagnostico(req(base), d);
  assert.equal(r.status, 200);
  assert.equal(((await r.json()) as { correo_enviado: boolean }).correo_enviado, false);
});

test("correos: escapan lo que escribió la persona y traen el nivel de interés", () => {
  const r = DIAG.evaluar("restaurante", bien);
  const c = { nombre: "Ana <script>alert(1)</script>", negocio: '"><img src=x onerror=1>', email: "a@b.pe", celular: "999111222" };
  const planes = { "plan-inicial": "Plan Inicial", "plan-profesional": "Plan Profesional", "plan-avanzado": "Plan Avanzado" };
  const cli = correoCliente(r, c, { sitio: "https://www.three3agency.com", whatsapp: "51922075014", planes });
  const av = correoAviso(r, c, { aviso: "yo@x.pe", sitio: "https://www.three3agency.com", planes });
  for (const h of [cli.html, av.html]) { assert.doesNotMatch(h, /<script>/); assert.doesNotMatch(h, /<img src=x/); }
  assert.match(av.asunto, /Muy interesado/);
  assert.deepEqual(av.para, ["yo@x.pe"]);
  assert.equal(av.responder, "a@b.pe");
  assert.match(cli.html, /wa\.me\/51922075014/);
  assert.match(cli.texto, /estimación orientativa/i);
});

test("enviar correo: usa Resend con la llave y falla si el proveedor rechaza", async () => {
  const llamadas: { u: string; h: Record<string, string>; b: { from: string; to: string[] } }[] = [];
  const f = (async (u: string, init: RequestInit) => { llamadas.push({ u, h: init.headers as Record<string, string>, b: JSON.parse(String(init.body)) }); return new Response("{}", { status: llamadas.length === 2 ? 422 : 200 }); }) as unknown as typeof fetch;
  const c = { para: ["a@b.pe"], asunto: "x", html: "<p>x</p>", texto: "x" };
  await enviarCorreo({ clave: "re_123", remitente: "THREE3 <d@three3agency.com>", fetch: f }, c);
  assert.equal(llamadas[0].u, "https://api.resend.com/emails");
  assert.equal(llamadas[0].h.Authorization, "Bearer re_123");
  assert.deepEqual(llamadas[0].b.to, ["a@b.pe"]);
  await assert.rejects(() => enviarCorreo({ clave: "k", remitente: "x", fetch: f }, c), /correo_422/);
});

test("admin diagnósticos: clave, lista y cambio de estado", async () => {
  const cambios: [number, string][] = [];
  const d: DepAdminDiag = { adminToken: "clave_larga_de_prueba", limitador: contadorMemoria(), listar: async () => [], actualizar: async (i, e) => { cambios.push([i, e]); } };
  const pet = (m: string, t?: string, b?: unknown) => new Request("https://x.test/api/admin/diagnosticos", { method: m, headers: t ? { authorization: `Bearer ${t}` } : {}, body: b ? JSON.stringify(b) : undefined });
  assert.equal((await manejarAdminDiagnosticos(pet("GET"), d)).status, 401);
  assert.equal((await manejarAdminDiagnosticos(pet("GET", "clave_larga_de_prueba"), d)).status, 200);
  assert.equal((await manejarAdminDiagnosticos(pet("PATCH", "clave_larga_de_prueba", { id: 3, estado: "contactado" }), d)).status, 200);
  assert.deepEqual(cambios, [[3, "contactado"]]);
  assert.equal((await manejarAdminDiagnosticos(pet("PATCH", "clave_larga_de_prueba", { id: 3, estado: "hackeado" }), d)).status, 422);
});
