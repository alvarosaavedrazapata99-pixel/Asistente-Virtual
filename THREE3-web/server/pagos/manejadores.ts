import LEADS from "../../scripts/leads/core.js";
import { ErrorHttp, ipDe, json, leerJson } from "../http.ts";
import { dentroDelLimite, type Contador } from "../seguridad/limitador.ts";
import { iguales, nuevoToken, sha256Hex, tokenValido } from "../seguridad/tokens.ts";
import { crearPreferencia, type ConfigMP } from "./mercadopago.ts";
import type { Almacen } from "./tipos.ts";
import { procesarAviso } from "./webhook.ts";

export type DepPagos = { almacen: Almacen; mp: ConfigMP; limitador: Contador; adminToken: string; fetch?: typeof fetch };

const ID = /^[A-Za-z0-9_-]{8,64}$/;
const NO_ENCONTRADA = () => json(404, { ok: false, error: "no_encontrada" }); // misma respuesta si falta la orden o el token: no se puede enumerar

async function ordenAutorizada(dep: DepPagos, id: string, token: string) {
  if (!ID.test(id)) return null;
  const orden = await dep.almacen.obtenerOrden(id);
  if (!orden || !(await tokenValido(token, orden.token_hash))) return null;
  return orden;
}

/** GET /api/pagos/orden?o=&t= : resumen para la página de pago. */
export async function manejarConsulta(r: Request, dep: DepPagos): Promise<Response> {
  if (r.method !== "GET") return json(405, { ok: false });
  if (!(await dentroDelLimite(dep.limitador, `consulta:${ipDe(r)}`, 30, 60))) return json(429, { ok: false });
  const u = new URL(r.url);
  const orden = await ordenAutorizada(dep, u.searchParams.get("o") ?? "", u.searchParams.get("t") ?? "");
  if (!orden) return NO_ENCONTRADA();
  return json(200, { ok: true, servicio_id: orden.servicio_id, descripcion: orden.descripcion, monto_pen: orden.monto_pen, estado: orden.estado });
}

/** POST /api/pagos/crear {o,t} : crea el cobro en Mercado Pago con el monto GUARDADO en el servidor. */
export async function manejarCrear(r: Request, dep: DepPagos): Promise<Response> {
  if (r.method !== "POST") return json(405, { ok: false });
  if (!(await dentroDelLimite(dep.limitador, `crear:${ipDe(r)}`, 10, 600))) return json(429, { ok: false });
  let b: { o?: string; t?: string };
  try { b = (await leerJson(r)) as { o?: string; t?: string }; } catch (e) { return json(e instanceof ErrorHttp ? e.status : 400, { ok: false }); }
  const orden = await ordenAutorizada(dep, String(b?.o ?? ""), String(b?.t ?? ""));
  if (!orden) return NO_ENCONTRADA();
  if (orden.estado !== "creado") return json(409, { ok: false, error: "orden_no_pagable", estado: orden.estado });
  try {
    const pref = await crearPreferencia(dep.mp, orden, String(b.t), dep.fetch);
    return json(200, { ok: true, url: pref.init_point });
  } catch {
    return json(502, { ok: false, error: "no_disponible" });
  }
}

/** POST /api/pagos/webhook : aviso de Mercado Pago. */
export async function manejarWebhook(r: Request, dep: DepPagos): Promise<Response> {
  if (r.method !== "POST") return json(405, { ok: false });
  let cuerpo: unknown = {};
  try { cuerpo = await leerJson(r); } catch { /* algunos avisos llegan sin cuerpo: el dato viene en la URL */ }
  const res = await procesarAviso({ almacen: dep.almacen, mp: dep.mp, fetch: dep.fetch }, new URL(r.url), r.headers, cuerpo);
  return json(res.status, { ok: res.status < 300, accion: res.accion });
}

/** POST /api/admin/ordenes : crea la orden tras acordar la cotización. Solo con la clave de administración. */
export async function manejarCrearOrden(r: Request, dep: DepPagos, siteUrl: string): Promise<Response> {
  if (r.method !== "POST") return json(405, { ok: false });
  if (!(await dentroDelLimite(dep.limitador, `admin:${ipDe(r)}`, 20, 3600))) return json(429, { ok: false });
  const recibido = (r.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  // se comparan hashes: mismo largo siempre y sin filtrar información por tiempo
  if (!dep.adminToken || !iguales(await sha256Hex(recibido), await sha256Hex(dep.adminToken))) return json(401, { ok: false });
  let b: Record<string, unknown>;
  try { b = (await leerJson(r)) as Record<string, unknown>; } catch (e) { return json(e instanceof ErrorHttp ? e.status : 400, { ok: false }); }
  const monto = Number(b["monto_pen"]);
  const servicio = String(b["servicio_id"] ?? "");
  const descripcion = LEADS.normTexto(b["descripcion"]).slice(0, 120);
  if (!LEADS.SERVICIOS.includes(servicio)) return json(422, { ok: false, error: "servicio" });
  if (!Number.isFinite(monto) || monto < 1 || monto > 100000) return json(422, { ok: false, error: "monto" });
  if (descripcion.length < 3) return json(422, { ok: false, error: "descripcion" });
  const { token, hash } = await nuevoToken();
  const orden = await dep.almacen.crearOrden({ token_hash: hash, servicio_id: servicio, descripcion, monto_pen: Math.round(monto * 100) / 100 });
  return json(201, { ok: true, id: orden.id, token, enlace: `${siteUrl}/pagar?o=${encodeURIComponent(orden.id)}&t=${encodeURIComponent(token)}` });
}
