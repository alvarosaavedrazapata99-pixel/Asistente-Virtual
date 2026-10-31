import type { Almacen, Estado, NuevaOrden, Orden, PagoRegistro } from "./tipos.ts";

type Cfg = { url: string; claveServicio: string; fetch?: typeof fetch };

/** Almacén sobre Supabase (PostgREST). Usa la clave de servicio: SOLO se ejecuta en el servidor, nunca en el navegador. */
export function almacenSupabase(cfg: Cfg): Almacen {
  const f = cfg.fetch ?? fetch;
  const base = `${cfg.url.replace(/\/$/, "")}/rest/v1`;
  const cab = (extra: Record<string, string> = {}) => ({ apikey: cfg.claveServicio, Authorization: `Bearer ${cfg.claveServicio}`, "Content-Type": "application/json", ...extra });
  const enc = encodeURIComponent;

  async function pedir(ruta: string, init: RequestInit): Promise<unknown[]> {
    const r = await f(`${base}/${ruta}`, init);
    if (!r.ok) throw new Error(`supabase_${r.status}`);
    const t = await r.text();
    return t ? (JSON.parse(t) as unknown[]) : [];
  }

  return {
    async crearOrden(o: NuevaOrden) {
      const filas = await pedir("ordenes", { method: "POST", headers: cab({ Prefer: "return=representation" }), body: JSON.stringify({ ...o, estado: "creado" }) });
      return filas[0] as Orden;
    },
    async obtenerOrden(id) {
      const filas = await pedir(`ordenes?id=eq.${enc(id)}&select=*&limit=1`, { headers: cab() });
      return (filas[0] as Orden) ?? null;
    },
    async cambiarEstado(id, de: Estado, a: Estado, motivo) {
      const filas = await pedir(`ordenes?id=eq.${enc(id)}&estado=eq.${enc(de)}`, {
        method: "PATCH", headers: cab({ Prefer: "return=representation" }), body: JSON.stringify({ estado: a, actualizado_en: new Date().toISOString() }),
      });
      if (filas.length === 0) return false;
      await pedir("orden_eventos", { method: "POST", headers: cab(), body: JSON.stringify({ orden_id: id, de, a, motivo }) });
      return true;
    },
    async registrarEvento(proveedor, eventoId, payload) {
      const filas = await pedir("webhook_eventos", {
        method: "POST", headers: cab({ Prefer: "resolution=ignore-duplicates,return=representation" }),
        body: JSON.stringify({ proveedor, evento_id: eventoId, payload }),
      });
      return filas.length > 0; // vacío = ya existía
    },
    async registrarPago(p: PagoRegistro) {
      await pedir("pagos?on_conflict=proveedor,pago_externo_id", { method: "POST", headers: cab({ Prefer: "resolution=merge-duplicates" }), body: JSON.stringify(p) });
    },
    async registrarAnomalia(orden, tipo, detalle) {
      await pedir("anomalias", { method: "POST", headers: cab(), body: JSON.stringify({ orden_id: orden, tipo, detalle }) });
    },
  };
}
