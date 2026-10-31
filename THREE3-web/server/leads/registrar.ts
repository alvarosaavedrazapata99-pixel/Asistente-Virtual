import LEADS from "../../scripts/leads/core.js";
import { ErrorHttp, ipDe, json, leerJson } from "../http.ts";
import { dentroDelLimite, type Contador } from "../seguridad/limitador.ts";
import { verificarTurnstile } from "../seguridad/turnstile.ts";

export type DepLeads = {
  registrar: (p: Record<string, unknown>) => Promise<{ estado: string }>;
  limitador: Contador;
  turnstile: { secreto: string; entorno: string; fetch?: typeof fetch };
};

const corto = (v: unknown, n: number): string => LEADS.normTexto(v).slice(0, n);

/** POST /api/leads: protegido con límite por IP, campo trampa y Turnstile. La deduplicación final la hace la base de datos. */
export async function manejarLead(r: Request, dep: DepLeads): Promise<Response> {
  if (r.method !== "POST") return json(405, { ok: false, error: "metodo" });
  const ip = ipDe(r);
  if (!(await dentroDelLimite(dep.limitador, `lead:${ip}`, 8, 600))) return json(429, { ok: false, error: "demasiados_envios" });
  let p: Record<string, unknown>;
  try { p = (await leerJson(r)) as Record<string, unknown>; } catch (e) { return json(e instanceof ErrorHttp ? e.status : 400, { ok: false, error: "solicitud" }); }
  if (!p || typeof p !== "object") return json(400, { ok: false, error: "solicitud" });
  if (p["web_url_trampa"]) return json(200, { ok: true, estado: "reintento" }); // un bot llenó el campo invisible

  if (!(await verificarTurnstile({ ...dep.turnstile, token: String(p["turnstile"] ?? ""), ip }))) return json(403, { ok: false, error: "verificacion" });

  const nombre = corto(p["nombre"], 120);
  const email = LEADS.normEmail(p["email"]);
  const celular = LEADS.normCel(p["celular"]);
  const servicio = String(p["servicio_id"] ?? "");
  if (nombre.length < 2) return json(422, { ok: false, error: "nombre" });
  if (!email && !celular) return json(422, { ok: false, error: "contacto" });
  if (!LEADS.SERVICIOS.includes(servicio)) return json(422, { ok: false, error: "servicio" });
  if (p["consentimiento"] !== true) return json(422, { ok: false, error: "consentimiento" });

  const limpio = {
    nombre, negocio: corto(p["negocio"], 120), email_norm: email, celular_norm: celular, servicio_id: servicio, detalle: corto(p["detalle"], 1000),
    utm_source: corto(p["utm_source"], 60) || "directo", utm_medium: corto(p["utm_medium"], 60) || "none", utm_campaign: corto(p["utm_campaign"], 60) || "none",
    dispositivo: corto(p["dispositivo"], 12), idempotency_key: corto(p["idempotency_key"], 80),
  };
  try {
    const res = await dep.registrar(limpio);
    return json(200, { ok: true, estado: res.estado });
  } catch {
    return json(502, { ok: false, error: "no_disponible" });
  }
}
