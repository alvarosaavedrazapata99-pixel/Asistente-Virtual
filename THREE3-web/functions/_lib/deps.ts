import { modoMercadoPago } from "../../server/pagos/modo.ts";
import { cabecerasSupabase } from "../../server/pagos/cabeceras-supabase.ts";
import { almacenBot } from "../../server/bot/almacen-bot.ts";
import { instrucciones, responderConModelo, type Conocimiento, type PlanesConfig } from "../../server/bot/cerebro.ts";
import { enviarTexto } from "../../server/bot/meta.ts";
import { almacenDiagnostico } from "../../server/diagnostico/almacen.ts";
import { correoAviso, correoCliente, enviarCorreo } from "../../server/diagnostico/correo.ts";
import type { DepDiagnostico } from "../../server/diagnostico/registrar.ts";
import empresa from "../../src/config/empresa.config.json" with { type: "json" };
import { registrarUso } from "../../server/uso/uso.ts";
import { almacenWidget } from "../../server/widget/almacen.ts";
import type { DepWidget } from "../../server/widget/chat.ts";
import type { DepDemo } from "../../server/demo/chat.ts";
import type { DepBot } from "../../server/bot/manejador.ts";
import planes from "../../src/config/planes.config.json" with { type: "json" };
import conocimiento from "../../src/config/conocimiento.config.json" with { type: "json" };
const planesConfig = planes;
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
  RESEND_API_KEY?: string; // para enviar los correos del diagnóstico (https://resend.com)
  EMAIL_REMITENTE?: string; // ej.: THREE3 <diagnostico@three3agency.com> (dominio verificado en Resend)
  AVISO_EMAIL?: string; // a dónde te avisa cada diagnóstico nuevo
  WIDGET_IA_ACTIVA?: string; // "si" permite que los bots de clientes respondan con IA
  DEMO_IA_ACTIVA?: string; // "si" enciende la demo con IA real en la web
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
  const sistema = instrucciones(planes as PlanesConfig, humano, conocimiento as Conocimiento);
  const envio = { whatsappToken: env.WHATSAPP_TOKEN ?? "", whatsappPhoneId: env.WHATSAPP_PHONE_ID ?? "", instagramToken: env.INSTAGRAM_TOKEN ?? "" };
  return {
    activo: env.BOT_ACTIVO === "si" && !!env.ANTHROPIC_API_KEY,
    appSecret: env.META_APP_SECRET ?? "",
    verifyToken: env.META_VERIFY_TOKEN ?? "",
    limitador: limitadorDe(env),
    ...almacen,
    responder: (h, t) => { const modelo = env.BOT_MODELO || "claude-haiku-5-5"; const uso = registrarUso({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }); return responderConModelo({ clave: env.ANTHROPIC_API_KEY ?? "", modelo, alUsar: (u) => uso("bot", "", modelo, u) }, sistema, h, t); },
    enviar: (canal, para, texto) => enviarTexto(envio, canal, para, texto),
    textoHumano: `Gracias por escribir a THREE3. Una persona del equipo te contactará pronto. Si prefieres, escríbenos directo aquí: ${humano}`,
  };
}

export function depDemo(env: Env): DepDemo {
  const sitio = (env.SITE_URL || "https://www.three3agency.com").replace(/\/$/, "");
  const sinWww = sitio.replace("://www.", "://");
  const conWww = sitio.includes("://www.") ? sitio : sitio.replace("://", "://www.");
  return {
    activo: env.DEMO_IA_ACTIVA === "si" && !!env.ANTHROPIC_API_KEY,
    limitador: limitadorDe(env),
    origenesPermitidos: [...new Set([sitio, sinWww, conWww])],
    responder: (sistema, h, t) => { const modelo = env.BOT_MODELO || "claude-haiku-5-5"; const uso = registrarUso({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }); return responderConModelo({ clave: env.ANTHROPIC_API_KEY ?? "", modelo, alUsar: (u) => uso("demo", "", modelo, u) }, sistema, h, t); },
  };
}

export function depWidget(env: Env): DepWidget {
  return {
    iaActiva: !!env.ANTHROPIC_API_KEY && env.WIDGET_IA_ACTIVA === "si",
    limitador: limitadorDe(env),
    ...almacenWidget({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }),
    responder: (sistema, h, t, clienteId) => { const modelo = env.BOT_MODELO || "claude-haiku-5-5"; const uso = registrarUso({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }); return responderConModelo({ clave: env.ANTHROPIC_API_KEY ?? "", modelo, alUsar: (u) => uso("widget", clienteId, modelo, u) }, sistema, h, t); },
  };
}

export function depDiagnostico(env: Env): DepDiagnostico {
  const sitio = (env.SITE_URL || "https://www.three3agency.com").replace(/\/$/, "");
  const planes = Object.fromEntries(planesConfig.planes.map((p) => [p.id, p.modulo ? p.nombre : `Plan ${p.nombre}`]));
  const whatsapp = empresa.whatsapp_activo ? empresa.whatsapp.replace(/\D/g, "") : "";
  const aviso = env.AVISO_EMAIL || empresa.correo;
  return {
    limitador: limitadorDe(env),
    turnstile: { secreto: env.TURNSTILE_SECRET, entorno: env.ENTORNO },
    ...almacenDiagnostico({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }),
    notificar: async (r, c) => {
      if (!env.RESEND_API_KEY || !env.EMAIL_REMITENTE) return { cliente: false, aviso: false };
      const cfg = { clave: env.RESEND_API_KEY, remitente: env.EMAIL_REMITENTE };
      const [cliente, avisoOk] = await Promise.allSettled([
        c.email ? enviarCorreo(cfg, correoCliente(r, c, { sitio, whatsapp, planes })) : Promise.reject(new Error("sin_correo")),
        aviso ? enviarCorreo(cfg, correoAviso(r, c, { aviso, sitio, planes })) : Promise.reject(new Error("sin_aviso")),
      ]);
      return { cliente: cliente.status === "fulfilled", aviso: avisoOk.status === "fulfilled" };
    },
  };
}
