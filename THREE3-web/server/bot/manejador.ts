import { ErrorHttp, json } from "../http.ts";
import { dentroDelLimite, type Contador } from "../seguridad/limitador.ts";
import { iguales } from "../seguridad/tokens.ts";
import { firmaValida, extraerMensajes, type Canal, type Entrante } from "./meta.ts";
import { pideHumano, type Turno } from "./cerebro.ts";

export type DepBot = {
  activo: boolean;
  appSecret: string;
  verifyToken: string;
  limitador: Contador;
  /** Guarda el mensaje. Devuelve false si ese id ya se había procesado (Meta reintenta avisos). */
  guardarEntrante: (m: Entrante) => Promise<boolean>;
  guardarRespuesta: (canal: Canal, de: string, texto: string, derivado: boolean) => Promise<void>;
  historial: (canal: Canal, de: string) => Promise<Turno[]>;
  responder: (historial: Turno[], texto: string) => Promise<string>;
  enviar: (canal: Canal, para: string, texto: string) => Promise<void>;
  textoHumano: string;
};

const MAX_CUERPO = 256 * 1024;

/** GET: Meta verifica la dirección. POST: llegan mensajes. Siempre se responde 200 a avisos válidos para que Meta no reintente sin fin. */
export async function manejarMeta(r: Request, dep: DepBot): Promise<Response> {
  if (r.method === "GET") {
    const q = new URL(r.url).searchParams;
    const ok = q.get("hub.mode") === "subscribe" && !!dep.verifyToken && iguales(q.get("hub.verify_token") ?? "", dep.verifyToken);
    return ok ? new Response(q.get("hub.challenge") ?? "", { status: 200 }) : json(403, { ok: false });
  }
  if (r.method !== "POST") return json(405, { ok: false });

  const cuerpo = await r.text();
  if (cuerpo.length > MAX_CUERPO) return json(413, { ok: false });
  if (!(await firmaValida(dep.appSecret, cuerpo, r.headers.get("x-hub-signature-256")))) return json(401, { ok: false });
  if (!dep.activo) return json(200, { ok: true, bot: "apagado" });

  let payload: unknown;
  try { payload = JSON.parse(cuerpo); } catch { return json(400, { ok: false }); }

  for (const m of extraerMensajes(payload)) {
    try {
      if (!(await dep.guardarEntrante(m))) continue; // ya procesado
      // Máximo 20 mensajes por persona cada 10 minutos: protege contra abuso y gasto del modelo.
      if (!(await dentroDelLimite(dep.limitador, `bot:${m.canal}:${m.de}`, 20, 600))) continue;
      const derivar = pideHumano(m.texto);
      // El historial ya incluye este mensaje (se guardó arriba); se quita para no repetirlo ante el modelo.
      const previo = await dep.historial(m.canal, m.de);
      const ultimo = previo[previo.length - 1];
      const historial = ultimo && ultimo.rol === "usuario" && ultimo.texto === m.texto ? previo.slice(0, -1) : previo;
      let texto: string;
      try {
        texto = derivar ? dep.textoHumano : await dep.responder(historial, m.texto);
      } catch {
        texto = dep.textoHumano; // si el modelo falla, la persona no se queda sin respuesta
      }
      await dep.enviar(m.canal, m.de, texto);
      await dep.guardarRespuesta(m.canal, m.de, texto, derivar);
    } catch (e) {
      if (e instanceof ErrorHttp) return json(e.status, { ok: false });
      // un mensaje que falla no debe impedir procesar los demás ni provocar reintentos
    }
  }
  return json(200, { ok: true });
}
