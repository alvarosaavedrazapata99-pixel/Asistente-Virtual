/** Entrada para Cloudflare Workers: sirve /api/* con los mismos manejadores que functions/ y deja el resto a los archivos estáticos (out/). */
import { onRequest as leads } from "../functions/api/leads.ts";
import { onRequest as demoChat } from "../functions/api/demo-chat.ts";
import { onRequest as widget } from "../functions/api/widget.ts";
import { onRequest as meta } from "../functions/api/meta.ts";
import { onRequest as pagosCrear } from "../functions/api/pagos/crear.ts";
import { onRequest as pagosWebhook } from "../functions/api/pagos/webhook.ts";
import { onRequest as pagosOrden } from "../functions/api/pagos/orden.ts";
import { onRequest as adminLeads } from "../functions/api/admin/leads.ts";
import { onRequest as adminOrdenes } from "../functions/api/admin/ordenes.ts";
import type { Env } from "../functions/_lib/deps.ts";

type Ruta = (c: { request: Request; env: Env }) => Response | Promise<Response>;
const RUTAS: Record<string, Ruta> = {
  "/api/leads": leads,
  "/api/meta": meta,
  "/api/widget": widget,
  "/api/demo-chat": demoChat,
  "/api/pagos/crear": pagosCrear,
  "/api/pagos/webhook": pagosWebhook,
  "/api/pagos/orden": pagosOrden,
  "/api/admin/ordenes": adminOrdenes,
  "/api/admin/leads": adminLeads,
};

export default {
  async fetch(request: Request, env: Env & { ASSETS: { fetch(r: Request): Promise<Response> } }): Promise<Response> {
    const { pathname } = new URL(request.url);
    const ruta = RUTAS[pathname.replace(/\/$/, "")];
    if (ruta) return ruta({ request, env });
    if (pathname.startsWith("/api/")) return new Response("No encontrado", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
