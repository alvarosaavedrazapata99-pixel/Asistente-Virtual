import { ipDe, json } from "../http.ts";
import { cabecerasSupabase } from "../pagos/cabeceras-supabase.ts";
import { dentroDelLimite, type Contador } from "../seguridad/limitador.ts";
import { iguales, sha256Hex } from "../seguridad/tokens.ts";
import type { Uso } from "../bot/cerebro.ts";

export type Origen = "widget" | "demo" | "bot";

/** Guarda los tokens reales de una consulta a la IA (para saber cuánto cuesta cada cliente). */
export function registrarUso(cfg: { url: string; clave: string; fetch?: typeof fetch }) {
  const f = cfg.fetch ?? fetch;
  return async (origen: Origen, cliente: string, modelo: string, u: Uso): Promise<void> => {
    const r = await f(`${cfg.url.replace(/\/$/, "")}/rest/v1/uso_ia`, {
      method: "POST",
      headers: cabecerasSupabase(cfg.clave, { Prefer: "return=minimal" }),
      body: JSON.stringify({ origen, cliente, modelo, tokens_in: u.entrada, tokens_out: u.salida, tokens_cache: u.cache }),
    });
    if (!r.ok) throw new Error(`uso_${r.status}`);
  };
}

export type FilaUso = { cliente: string; origen: string; modelo: string; mes: string; llamadas: number; tin: number; tout: number; tcache: number };
export type DepAdminUso = { adminToken: string; limitador: Contador; resumen: () => Promise<FilaUso[]> };

/** GET /api/admin/uso: consumo mensual por cliente, origen y modelo. Solo con la clave de administración. */
export async function manejarAdminUso(r: Request, dep: DepAdminUso): Promise<Response> {
  if (r.method !== "GET") return json(405, { ok: false });
  if (!(await dentroDelLimite(dep.limitador, `adminuso:${ipDe(r)}`, 120, 3600))) return json(429, { ok: false });
  const recibido = (r.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!dep.adminToken || !iguales(await sha256Hex(recibido), await sha256Hex(dep.adminToken))) return json(401, { ok: false });
  try { return json(200, { ok: true, filas: await dep.resumen() }); } catch { return json(502, { ok: false, error: "no_disponible" }); }
}

export function almacenResumenUso(cfg: { url: string; clave: string; fetch?: typeof fetch }): Pick<DepAdminUso, "resumen"> {
  const f = cfg.fetch ?? fetch;
  return {
    async resumen() {
      const r = await f(`${cfg.url.replace(/\/$/, "")}/rest/v1/uso_ia_mensual?select=*&order=mes.desc&limit=500`, { headers: cabecerasSupabase(cfg.clave) });
      if (!r.ok) throw new Error(`uso_resumen_${r.status}`);
      return (await r.json()) as FilaUso[];
    },
  };
}
