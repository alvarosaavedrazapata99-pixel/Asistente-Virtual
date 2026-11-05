import { ErrorHttp, ipDe, json, leerJson } from "../http.ts";
import { cabecerasSupabase } from "../pagos/cabeceras-supabase.ts";
import { dentroDelLimite, type Contador } from "../seguridad/limitador.ts";
import { iguales, sha256Hex } from "../seguridad/tokens.ts";

export const ESTADOS_SOLICITUD = ["nueva", "contactada", "cotizada", "aceptada", "perdida"] as const;

export type FilaLead = {
  id: number; servicio_id: string; detalle: string; utm_source: string; utm_campaign: string; estado: string; intentos_duplicados: number; creado_en: string;
  contactos: { id: number; nombre: string; negocio: string; email_norm: string; celular_norm: string } | null;
};

export type DepAdminLeads = {
  adminToken: string;
  limitador: Contador;
  listar: () => Promise<FilaLead[]>;
  actualizar: (id: number, estado: string) => Promise<void>;
};

/** GET /api/admin/leads: últimas 100 solicitudes. PATCH: cambia el estado de una. Solo con la clave de administración. */
export async function manejarAdminLeads(r: Request, dep: DepAdminLeads): Promise<Response> {
  if (r.method !== "GET" && r.method !== "PATCH") return json(405, { ok: false });
  if (!(await dentroDelLimite(dep.limitador, `adminleads:${ipDe(r)}`, 60, 3600))) return json(429, { ok: false });
  const recibido = (r.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!dep.adminToken || !iguales(await sha256Hex(recibido), await sha256Hex(dep.adminToken))) return json(401, { ok: false });
  try {
    if (r.method === "GET") return json(200, { ok: true, leads: await dep.listar() });
    let b: Record<string, unknown>;
    try { b = (await leerJson(r)) as Record<string, unknown>; } catch (e) { return json(e instanceof ErrorHttp ? e.status : 400, { ok: false }); }
    const id = Number(b["id"]);
    const estado = String(b["estado"] ?? "");
    if (!Number.isInteger(id) || id < 1) return json(422, { ok: false, error: "id" });
    if (!(ESTADOS_SOLICITUD as readonly string[]).includes(estado)) return json(422, { ok: false, error: "estado" });
    await dep.actualizar(id, estado);
    return json(200, { ok: true });
  } catch {
    return json(502, { ok: false, error: "no_disponible" });
  }
}

export function almacenAdminLeads(cfg: { url: string; clave: string; fetch?: typeof fetch }): Pick<DepAdminLeads, "listar" | "actualizar"> {
  const f = cfg.fetch ?? fetch;
  const base = `${cfg.url.replace(/\/$/, "")}/rest/v1/solicitudes`;
  return {
    async listar() {
      const sel = "id,servicio_id,detalle,utm_source,utm_campaign,estado,intentos_duplicados,creado_en,contactos(id,nombre,negocio,email_norm,celular_norm)";
      const r = await f(`${base}?select=${encodeURIComponent(sel)}&order=id.desc&limit=100`, { headers: cabecerasSupabase(cfg.clave) });
      if (!r.ok) throw new Error(`admin_listar_${r.status}`);
      return (await r.json()) as FilaLead[];
    },
    async actualizar(id, estado) {
      const r = await f(`${base}?id=eq.${id}`, { method: "PATCH", headers: cabecerasSupabase(cfg.clave, { Prefer: "return=minimal" }), body: JSON.stringify({ estado }) });
      if (!r.ok) throw new Error(`admin_actualizar_${r.status}`);
    },
  };
}
