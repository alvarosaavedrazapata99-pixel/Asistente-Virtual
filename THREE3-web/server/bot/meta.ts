/** Meta (WhatsApp Cloud API e Instagram): verificación de firma, lectura de avisos y envío de respuestas. */
import { hmacSha256Hex, iguales } from "../seguridad/tokens.ts";

export type Canal = "whatsapp" | "instagram";
export type Entrante = { canal: Canal; de: string; id: string; texto: string; nombre?: string };

/** El aviso de Meta trae `x-hub-signature-256: sha256=<hmac del cuerpo con el secreto de la app>`. */
export async function firmaValida(secreto: string, cuerpo: string, cabecera: string | null): Promise<boolean> {
  if (!secreto || !cabecera || !cabecera.startsWith("sha256=")) return false;
  return iguales(await hmacSha256Hex(secreto, cuerpo), cabecera.slice(7).toLowerCase());
}

type Obj = Record<string, unknown>;
const esObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Extrae solo mensajes de texto de personas. Ignora ecos, estados de entrega, imágenes, audios y reacciones. */
export function extraerMensajes(payload: unknown): Entrante[] {
  const salida: Entrante[] = [];
  if (!esObj(payload)) return salida;
  for (const entrada of lista(payload["entry"])) {
    if (!esObj(entrada)) continue;
    if (payload["object"] === "whatsapp_business_account") {
      for (const cambio of lista(entrada["changes"])) {
        const valor = esObj(cambio) && esObj(cambio["value"]) ? cambio["value"] : null;
        if (!valor) continue;
        const nombres = new Map<string, string>();
        for (const c of lista(valor["contacts"])) {
          if (esObj(c) && typeof c["wa_id"] === "string" && esObj(c["profile"]) && typeof c["profile"]["name"] === "string") nombres.set(c["wa_id"], c["profile"]["name"]);
        }
        for (const m of lista(valor["messages"])) {
          if (!esObj(m) || m["type"] !== "text" || !esObj(m["text"])) continue;
          const de = String(m["from"] ?? ""), id = String(m["id"] ?? ""), texto = String(m["text"]["body"] ?? "");
          if (de && id && texto) salida.push({ canal: "whatsapp", de, id, texto, nombre: nombres.get(de) });
        }
      }
    } else if (payload["object"] === "instagram") {
      for (const ev of lista(entrada["messaging"])) {
        if (!esObj(ev) || !esObj(ev["message"]) || !esObj(ev["sender"])) continue;
        const m = ev["message"];
        if (m["is_echo"] === true || typeof m["text"] !== "string") continue;
        const de = String(ev["sender"]["id"] ?? ""), id = String(m["mid"] ?? "");
        if (de && id && m["text"]) salida.push({ canal: "instagram", de, id, texto: m["text"] });
      }
    }
  }
  return salida;
}

export type ConfigEnvio = { whatsappToken: string; whatsappPhoneId: string; instagramToken: string; version?: string; fetch?: typeof fetch };

/** Envía un texto por el canal. Lanza un error si Meta rechaza el envío. */
export async function enviarTexto(cfg: ConfigEnvio, canal: Canal, para: string, texto: string): Promise<void> {
  const f = cfg.fetch ?? fetch;
  const v = cfg.version ?? "v21.0";
  const cuerpo = texto.slice(0, 1500);
  const r =
    canal === "whatsapp"
      ? await f(`https://graph.facebook.com/${v}/${encodeURIComponent(cfg.whatsappPhoneId)}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${cfg.whatsappToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to: para, type: "text", text: { body: cuerpo } }),
        })
      : await f(`https://graph.facebook.com/${v}/me/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${cfg.instagramToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ recipient: { id: para }, message: { text: cuerpo } }),
        });
  if (!r.ok) throw new Error(`meta_envio_${r.status}`);
}
