import { cabecerasSupabase } from "../pagos/cabeceras-supabase.ts";
import type { ConfigCliente, DepWidget } from "./chat.ts";

export function almacenWidget(cfg: { url: string; clave: string; fetch?: typeof fetch }): Pick<DepWidget, "buscarCliente" | "guardarLead"> {
  const f = cfg.fetch ?? fetch;
  const base = cfg.url.replace(/\/$/, "") + "/rest/v1";
  return {
    async buscarCliente(id) {
      const r = await f(`${base}/clientes_bot?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, { headers: cabecerasSupabase(cfg.clave) });
      if (!r.ok) throw new Error(`widget_cliente_${r.status}`);
      const filas = (await r.json()) as ConfigCliente[];
      return filas[0] ?? null;
    },
    async guardarLead(l) {
      const r = await f(`${base}/leads_cliente`, { method: "POST", headers: cabecerasSupabase(cfg.clave, { Prefer: "return=minimal" }), body: JSON.stringify(l) });
      if (!r.ok) throw new Error(`widget_lead_${r.status}`);
    },
  };
}
