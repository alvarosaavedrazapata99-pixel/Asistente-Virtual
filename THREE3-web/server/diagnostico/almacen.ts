import { cabecerasSupabase } from "../pagos/cabeceras-supabase.ts";
import type { DepDiagnostico } from "./registrar.ts";

export function almacenDiagnostico(cfg: { url: string; clave: string; fetch?: typeof fetch }): Pick<DepDiagnostico, "registrarContacto" | "guardar"> {
  const f = cfg.fetch ?? fetch;
  const base = cfg.url.replace(/\/$/, "") + "/rest/v1";
  return {
    async registrarContacto(p) {
      const r = await f(`${base}/rpc/registrar_lead`, { method: "POST", headers: cabecerasSupabase(cfg.clave), body: JSON.stringify({ p }) });
      if (!r.ok) throw new Error(`diag_contacto_${r.status}`);
      return (await r.json()) as { estado: string; contacto_id?: number };
    },
    async guardar(d) {
      const r = await f(`${base}/diagnosticos?on_conflict=clave_idem`, {
        method: "POST",
        headers: cabecerasSupabase(cfg.clave, { Prefer: "resolution=ignore-duplicates,return=minimal" }),
        body: JSON.stringify({
          contacto_id: d.contacto_id, rubro: d.rubro, respuestas: d.respuestas, resultado: d.resultado, interes: d.resultado.interes.nivel,
          puntos: d.resultado.interes.puntos, madurez: d.resultado.madurez, plan_sugerido: d.resultado.plan, clave_idem: d.clave_idem || null,
        }),
      });
      if (!r.ok) throw new Error(`diag_guardar_${r.status}`);
    },
  };
}
