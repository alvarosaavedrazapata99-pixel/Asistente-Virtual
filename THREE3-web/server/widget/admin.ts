import { ErrorHttp, ipDe, json, leerJson } from "../http.ts";
import { cabecerasSupabase } from "../pagos/cabeceras-supabase.ts";
import { dentroDelLimite, type Contador } from "../seguridad/limitador.ts";
import { iguales, sha256Hex } from "../seguridad/tokens.ts";
import type { ConfigCliente } from "./chat.ts";

export type ResumenCliente = Pick<ConfigCliente, "id" | "nombre" | "activo" | "dominios" | "limite_diario" | "whatsapp" | "color">;
export type LeadCliente = { id: number; nombre: string; contacto: string; detalle: string; creado_en: string };

export type DepAdminClientes = {
  adminToken: string;
  limitador: Contador;
  listar: () => Promise<ResumenCliente[]>;
  obtener: (id: string) => Promise<ConfigCliente | null>;
  guardar: (c: ConfigCliente) => Promise<void>;
  leads: (id: string) => Promise<LeadCliente[]>;
};

const ORIGEN = /^https?:\/\/[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?$/;
const texto = (v: unknown, max: number): string => String(v ?? "").replace(/\u0000/g, "").trim().slice(0, max);

/** Valida y limpia lo que llega del panel. Devuelve el cliente listo o un motivo de rechazo. */
export function validarCliente(b: Record<string, unknown>): ConfigCliente | string {
  const id = texto(b["id"], 40);
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return "id";
  const nombre = texto(b["nombre"], 120);
  if (nombre.length < 2) return "nombre";
  const descripcion = texto(b["descripcion"], 6000);
  if (descripcion.length < 10) return "descripcion";
  const color = texto(b["color"], 7) || "#1E6BFF";
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return "color";
  const whatsapp = texto(b["whatsapp"], 20).replace(/\D/g, "");
  if (whatsapp && (whatsapp.length < 8 || whatsapp.length > 15)) return "whatsapp";
  const crudos = Array.isArray(b["dominios"]) ? (b["dominios"] as unknown[]) : [];
  const dominios = [...new Set(crudos.map((d) => texto(d, 120).toLowerCase().replace(/\/$/, "")))];
  if (dominios.length < 1 || dominios.length > 10 || dominios.some((d) => !ORIGEN.test(d))) return "dominios";
  const limite = Number(b["limite_diario"] ?? 300);
  if (!Number.isInteger(limite) || limite < 1 || limite > 5000) return "limite_diario";
  return {
    id, nombre, descripcion, color, whatsapp, dominios, limite_diario: limite, activo: b["activo"] === true,
    saludo: texto(b["saludo"], 300) || "¡Hola! Soy el asistente virtual de este negocio. ¿En qué te ayudo?",
  };
}

/** GET (lista | ?id= detalle | ?leads= clientes potenciales) y POST (crear o actualizar). Solo con la clave de administración. */
export async function manejarAdminClientes(r: Request, dep: DepAdminClientes): Promise<Response> {
  if (r.method !== "GET" && r.method !== "POST") return json(405, { ok: false });
  if (!(await dentroDelLimite(dep.limitador, `adminclientes:${ipDe(r)}`, 120, 3600))) return json(429, { ok: false });
  const recibido = (r.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!dep.adminToken || !iguales(await sha256Hex(recibido), await sha256Hex(dep.adminToken))) return json(401, { ok: false });
  const q = new URL(r.url).searchParams;
  try {
    if (r.method === "GET") {
      const idLeads = q.get("leads"), id = q.get("id");
      if (idLeads) return /^[a-z0-9-]{2,40}$/.test(idLeads) ? json(200, { ok: true, leads: await dep.leads(idLeads) }) : json(422, { ok: false, error: "id" });
      if (id) {
        if (!/^[a-z0-9-]{2,40}$/.test(id)) return json(422, { ok: false, error: "id" });
        const c = await dep.obtener(id);
        return c ? json(200, { ok: true, cliente: c }) : json(404, { ok: false });
      }
      return json(200, { ok: true, clientes: await dep.listar() });
    }
    let b: Record<string, unknown>;
    try { b = (await leerJson(r, 12000)) as Record<string, unknown>; } catch (e) { return json(e instanceof ErrorHttp ? e.status : 400, { ok: false }); }
    const v = validarCliente(b ?? {});
    if (typeof v === "string") return json(422, { ok: false, error: v });
    await dep.guardar(v);
    return json(200, { ok: true });
  } catch {
    return json(502, { ok: false, error: "no_disponible" });
  }
}

export function almacenAdminClientes(cfg: { url: string; clave: string; fetch?: typeof fetch }): Pick<DepAdminClientes, "listar" | "obtener" | "guardar" | "leads"> {
  const f = cfg.fetch ?? fetch;
  const base = cfg.url.replace(/\/$/, "") + "/rest/v1";
  const pedir = async (ruta: string, init?: RequestInit) => {
    const r = await f(base + ruta, { ...init, headers: cabecerasSupabase(cfg.clave, (init?.headers as Record<string, string>) ?? {}) });
    if (!r.ok) throw new Error(`admin_clientes_${r.status}`);
    return r;
  };
  return {
    async listar() { return (await (await pedir("/clientes_bot?select=id,nombre,activo,dominios,limite_diario,whatsapp,color&order=creado_en.desc&limit=200")).json()) as ResumenCliente[]; },
    async obtener(id) { return ((await (await pedir(`/clientes_bot?id=eq.${encodeURIComponent(id)}&select=*&limit=1`)).json()) as ConfigCliente[])[0] ?? null; },
    async guardar(c) { await pedir("/clientes_bot?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(c) }); },
    async leads(id) { return (await (await pedir(`/leads_cliente?cliente=eq.${encodeURIComponent(id)}&select=id,nombre,contacto,detalle,creado_en&order=id.desc&limit=100`)).json()) as LeadCliente[]; },
  };
}
