import { ErrorHttp, ipDe, json, leerJson } from "../http.ts";
import { cabecerasSupabase } from "../pagos/cabeceras-supabase.ts";
import { dentroDelLimite, type Contador } from "../seguridad/limitador.ts";
import { iguales, sha256Hex } from "../seguridad/tokens.ts";

export const ESTADOS_DIAG = ["nuevo", "contactado", "cotizado", "cliente", "descartado"] as const;

export type FilaDiag = {
  id: number; rubro: string; interes: string; puntos: number; madurez: number; plan_sugerido: string; estado: string; creado_en: string;
  resultado: { perdidas?: number; consultas?: number; rubroNombre?: string; modulo?: boolean };
  contactos: { nombre: string; negocio: string; email_norm: string; celular_norm: string } | null;
};

export type DepAdminDiag = { adminToken: string; limitador: Contador; listar: () => Promise<FilaDiag[]>; actualizar: (id: number, estado: string) => Promise<void> };

/** GET: últimos 100 diagnósticos (los más interesados primero en el panel). PATCH: cambia el estado de seguimiento. */
export async function manejarAdminDiagnosticos(r: Request, dep: DepAdminDiag): Promise<Response> {
  if (r.method !== "GET" && r.method !== "PATCH") return json(405, { ok: false });
  if (!(await dentroDelLimite(dep.limitador, `admindiag:${ipDe(r)}`, 120, 3600))) return json(429, { ok: false });
  const recibido = (r.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!dep.adminToken || !iguales(await sha256Hex(recibido), await sha256Hex(dep.adminToken))) return json(401, { ok: false });
  try {
    if (r.method === "GET") return json(200, { ok: true, diagnosticos: await dep.listar() });
    let b: Record<string, unknown>;
    try { b = (await leerJson(r)) as Record<string, unknown>; } catch (e) { return json(e instanceof ErrorHttp ? e.status : 400, { ok: false }); }
    const id = Number(b["id"]), estado = String(b["estado"] ?? "");
    if (!Number.isInteger(id) || id < 1) return json(422, { ok: false, error: "id" });
    if (!(ESTADOS_DIAG as readonly string[]).includes(estado)) return json(422, { ok: false, error: "estado" });
    await dep.actualizar(id, estado);
    return json(200, { ok: true });
  } catch { return json(502, { ok: false, error: "no_disponible" }); }
}

export function almacenAdminDiag(cfg: { url: string; clave: string; fetch?: typeof fetch }): Pick<DepAdminDiag, "listar" | "actualizar"> {
  const f = cfg.fetch ?? fetch;
  const base = `${cfg.url.replace(/\/$/, "")}/rest/v1/diagnosticos`;
  return {
    async listar() {
      const sel = "id,rubro,interes,puntos,madurez,plan_sugerido,estado,creado_en,resultado,contactos(nombre,negocio,email_norm,celular_norm)";
      const r = await f(`${base}?select=${encodeURIComponent(sel)}&order=id.desc&limit=100`, { headers: cabecerasSupabase(cfg.clave) });
      if (!r.ok) throw new Error(`admin_diag_${r.status}`);
      return (await r.json()) as FilaDiag[];
    },
    async actualizar(id, estado) {
      const r = await f(`${base}?id=eq.${id}`, { method: "PATCH", headers: cabecerasSupabase(cfg.clave, { Prefer: "return=minimal" }), body: JSON.stringify({ estado }) });
      if (!r.ok) throw new Error(`admin_diag_${r.status}`);
    },
  };
}
