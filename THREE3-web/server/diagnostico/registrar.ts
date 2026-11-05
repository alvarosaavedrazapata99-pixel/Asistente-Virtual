import DIAG from "../../public/diagnostico-core.js";
import LEADS from "../../scripts/leads/core.js";
import { ErrorHttp, ipDe, json, leerJson } from "../http.ts";
import { dentroDelLimite, type Contador } from "../seguridad/limitador.ts";
import { verificarTurnstile } from "../seguridad/turnstile.ts";
import type { Resultado, Contacto } from "./correo.ts";

export type DepDiagnostico = {
  limitador: Contador;
  turnstile: { secreto: string; entorno: string; fetch?: typeof fetch };
  registrarContacto: (p: Record<string, unknown>) => Promise<{ estado: string; contacto_id?: number }>;
  guardar: (d: { contacto_id: number | null; rubro: string; respuestas: unknown; resultado: Resultado; clave_idem: string }) => Promise<void>;
  /** Envía los correos (cliente y aviso). Devuelve qué se pudo enviar; nunca debe impedir mostrar el resultado. */
  notificar: (r: Resultado, c: Contacto) => Promise<{ cliente: boolean; aviso: boolean }>;
};

const corto = (v: unknown, n: number): string => LEADS.normTexto(v).slice(0, n);

/** POST /api/diagnostico. El servidor valida y RECALCULA el resultado; lo que calcule el navegador solo sirve para mostrarlo al instante. */
export async function manejarDiagnostico(r: Request, dep: DepDiagnostico): Promise<Response> {
  if (r.method !== "POST") return json(405, { ok: false, error: "metodo" });
  const ip = ipDe(r);
  if (!(await dentroDelLimite(dep.limitador, `diag:${ip}`, 6, 3600))) return json(429, { ok: false, error: "demasiados_envios" });
  let p: Record<string, unknown>;
  try { p = (await leerJson(r, 6000)) as Record<string, unknown>; } catch (e) { return json(e instanceof ErrorHttp ? e.status : 400, { ok: false, error: "solicitud" }); }
  if (!p || typeof p !== "object") return json(400, { ok: false, error: "solicitud" });
  if (p["web_url_trampa"]) return json(200, { ok: true, estado: "reintento" });
  if (!(await verificarTurnstile({ ...dep.turnstile, token: String(p["turnstile"] ?? ""), ip }))) return json(403, { ok: false, error: "verificacion" });

  const rubro = String(p["rubro"] ?? "");
  const mal = DIAG.validar(rubro, p["respuestas"]);
  if (mal) return json(422, { ok: false, error: "respuestas", campo: mal });

  const nombre = corto(p["nombre"], 120);
  const email = LEADS.normEmail(p["email"]);
  const celular = LEADS.normCel(p["celular"]);
  if (nombre.length < 2) return json(422, { ok: false, error: "nombre" });
  if (!email && !celular) return json(422, { ok: false, error: "contacto" });
  if (p["consentimiento"] !== true) return json(422, { ok: false, error: "consentimiento" });
  const negocio = corto(p["negocio"], 120);
  const clave = corto(p["idempotency_key"], 80);

  const resultado = DIAG.evaluar(rubro, p["respuestas"] as Record<string, unknown>) as Resultado;
  const contacto: Contacto = { nombre, negocio, email, celular };
  let contactoId: number | null = null;
  try {
    const res = await dep.registrarContacto({
      nombre, negocio, email_norm: email, celular_norm: celular, servicio_id: "diagnostico",
      detalle: `Diagnóstico ${resultado.rubroNombre}: interés ${resultado.interes.nivel}, automatización ${resultado.madurez}/100`,
      utm_source: corto(p["utm_source"], 60) || "directo", utm_medium: corto(p["utm_medium"], 60) || "none", utm_campaign: corto(p["utm_campaign"], 60) || "none",
      dispositivo: corto(p["dispositivo"], 12), idempotency_key: clave ? `diag:${clave}` : "",
    });
    if (res.estado === "reintento") return json(200, { ok: true, estado: "reintento", resultado });
    contactoId = res.contacto_id ?? null;
    await dep.guardar({ contacto_id: contactoId, rubro, respuestas: p["respuestas"], resultado, clave_idem: clave });
  } catch {
    return json(502, { ok: false, error: "no_disponible" });
  }
  let enviados = { cliente: false, aviso: false };
  try { enviados = await dep.notificar(resultado, contacto); } catch { /* el resultado se muestra igual */ }
  return json(200, { ok: true, estado: "creado", resultado, correo_enviado: enviados.cliente });
}
