import { modoMercadoPago } from "../../server/pagos/modo.ts";
import { cabecerasSupabase } from "../../server/pagos/cabeceras-supabase.ts";
import { almacenBot } from "../../server/bot/almacen-bot.ts";
import { instrucciones, responderConModelo, type PlanesConfig } from "../../server/bot/cerebro.ts";
import { enviarTexto } from "../../server/bot/meta.ts";
import type { DepBot } from "../../server/bot/manejador.ts";
import planes from "../../src/config/planes.config.json" with { type: "json" };
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
  MP_MODO?: string;
  MP_PRODUCCION_APROBADA?: string;
  ADMIN_TOKEN: string;
  TURNSTILE_SECRET: string;
  BOT_ACTIVO?: string; // "si" enciende el bot; cualquier otro valor lo deja apagado
  BOT_MODELO?: string;
  META_APP_SECRET?: string;
  META_VERIFY_TOKEN?: string;
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_ID?: string;
  WHATSAPP_HUMANO?: string; // número al que se deriva a la persona, con código de país
  INSTAGRAM_TOKEN?: string;
  ANTHROPIC_API_KEY?: string;
  LIMITES?: { get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> };
};

let memoria: Contador | undefined;
export const limitadorDe = (env: Env): Contador => (env.LIMITES ? contadorKV(env.LIMITES) : (memoria ??= contadorMemoria()));

export function depPagos(env: Env): DepPagos {
  return {
    almacen: almacenSupabase({ url: env.SUPABASE_URL, claveServicio: env.SUPABASE_SERVICE_KEY }),
    mp: { accessToken: env.MP_ACCESS_TOKEN, webhookSecret: env.MP_WEBHOOK_SECRET, siteUrl: env.SITE_URL, sandbox: modoMercadoPago(env) === "prueba" },
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
        headers: cabecerasSupabase(env.SUPABASE_SERVICE_KEY),
        body: JSON.stringify({ p }),
      });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      return (await r.json()) as { estado: string };
    },
  };
}

export function depBot(env: Env): DepBot {
  const almacen = almacenBot({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY });
  const humano = env.WHATSAPP_HUMANO ? `https://wa.me/${env.WHATSAPP_HUMANO.replace(/\D/g, "")}` : "nuestro WhatsApp";
  const sistema = instrucciones(planes as PlanesConfig, humano);
  const envio = { whatsappToken: env.WHATSAPP_TOKEN ?? "", whatsappPhoneId: env.WHATSAPP_PHONE_ID ?? "", instagramToken: env.INSTAGRAM_TOKEN ?? "" };
  return {
    activo: env.BOT_ACTIVO === "si" && !!env.ANTHROPIC_API_KEY,
    appSecret: env.META_APP_SECRET ?? "",
    verifyToken: env.META_VERIFY_TOKEN ?? "",
    limitador: limitadorDe(env),
    ...almacen,
    responder: (h, t) => responderConModelo({ clave: env.ANTHROPIC_API_KEY ?? "", modelo: env.BOT_MODELO || "claude-haiku-5-5" }, sistema, h, t),
    enviar: (canal, para, texto) => enviarTexto(envio, canal, para, texto),
    textoHumano: `Gracias por escribir a THREE3. Una persona del equipo te contactará pronto. Si prefieres, escríbenos directo aquí: ${humano}`,
  };
}
