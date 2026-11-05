import { cabecerasSupabase } from "../pagos/cabeceras-supabase.ts";
import type { Canal, Entrante } from "./meta.ts";
import type { Turno } from "./cerebro.ts";

export type ConfigAlmacenBot = { url: string; clave: string; fetch?: typeof fetch };

/** Guarda la conversación en Supabase (tabla mensajes_bot). `msg_id` es único: así un aviso repetido no se procesa dos veces. */
export function almacenBot(cfg: ConfigAlmacenBot) {
  const f = cfg.fetch ?? fetch;
  const base = `${cfg.url.replace(/\/$/, "")}/rest/v1/mensajes_bot`;
  return {
    async guardarEntrante(m: Entrante): Promise<boolean> {
      const r = await f(`${base}?on_conflict=msg_id`, {
        method: "POST",
        headers: cabecerasSupabase(cfg.clave, { Prefer: "resolution=ignore-duplicates,return=representation" }),
        body: JSON.stringify({ canal: m.canal, contacto: m.de, nombre: m.nombre ?? "", msg_id: m.id, rol: "usuario", texto: m.texto.slice(0, 2000) }),
      });
      if (!r.ok) throw new Error(`bot_guardar_${r.status}`);
      return ((await r.json()) as unknown[]).length > 0;
    },
    async guardarRespuesta(canal: Canal, de: string, texto: string, derivado: boolean): Promise<void> {
      const r = await f(base, {
        method: "POST",
        headers: cabecerasSupabase(cfg.clave, { Prefer: "return=minimal" }),
        body: JSON.stringify({ canal, contacto: de, rol: "bot", texto: texto.slice(0, 2000), derivado }),
      });
      if (!r.ok) throw new Error(`bot_guardar_${r.status}`);
    },
    async historial(canal: Canal, de: string): Promise<Turno[]> {
      const q = `?canal=eq.${canal}&contacto=eq.${encodeURIComponent(de)}&select=rol,texto&order=id.desc&limit=10`;
      const r = await f(base + q, { headers: cabecerasSupabase(cfg.clave) });
      if (!r.ok) throw new Error(`bot_historial_${r.status}`);
      return ((await r.json()) as Turno[]).reverse();
    },
  };
}
