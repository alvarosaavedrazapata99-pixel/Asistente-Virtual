import { almacenSupabase } from "../../server/pagos/almacen-supabase.ts";
import type { DepLeads } from "../../server/leads/registrar.ts";
import type { DepPagos } from "../../server/pagos/manejadores.ts";
import { contadorKV, contadorMemoria, type Contador } from "../../server/seguridad/limitador.ts";

/** Variables y secretos que se configuran en Cloudflare Pages (Settings → Variables). Nunca van en el código ni en el navegador. */
export type Env = {
  SITE_URL: string;
  ENTORNO: string; // "produccion" | "desarrollo"
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  MP_ACCESS_TOKEN: string;
  MP_WEBHOOK_SECRET: string;
  MP_SANDBOX?: string;
  ADMIN_TOKEN: string;
  TURNSTILE_SECRET: string;
  LIMITES?: { get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> };
};

let memoria: Contador | undefined;
export const limitadorDe = (env: Env): Contador => (env.LIMITES ? contadorKV(env.LIMITES) : (memoria ??= contadorMemoria()));

export function depPagos(env: Env): DepPagos {
  return {
    almacen: almacenSupabase({ url: env.SUPABASE_URL, claveServicio: env.SUPABASE_SERVICE_KEY }),
    mp: { accessToken: env.MP_ACCESS_TOKEN, webhookSecret: env.MP_WEBHOOK_SECRET, siteUrl: env.SITE_URL, sandbox: env.MP_SANDBOX === "1" },
    limitador: limitadorDe(env),
    adminToken: env.ADMIN_TOKEN,
  };
}

export function depLeads(env: Env): DepLeads {
  const base = `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/rpc/registrar_lead`;
  return {
    limitador: limitadorDe(env),
    turnstile: { secreto: env.TURNSTILE_SECRET, entorno: env.ENTORNO },
    registrar: async (p) => {
      const r = await fetch(base, {
        method: "POST",
        headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p }),
      });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      return (await r.json()) as { estado: string };
    },
  };
}
