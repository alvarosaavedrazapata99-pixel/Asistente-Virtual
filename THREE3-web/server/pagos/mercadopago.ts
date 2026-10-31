import { hmacSha256Hex, iguales } from "../seguridad/tokens.ts";
import type { Orden, PagoProveedor, Preferencia } from "./tipos.ts";

export type ConfigMP = { accessToken: string; webhookSecret: string; siteUrl: string; sandbox?: boolean };
type Fetch = typeof fetch;

const API = "https://api.mercadopago.com";

/** Manifiesto que firma Mercado Pago: se omiten las partes que no llegan. */
export function construirManifest(dataId: string, requestId: string, ts: string): string {
  const id = /^[A-Za-z0-9]+$/.test(dataId) ? dataId.toLowerCase() : dataId;
  return [dataId ? `id:${id};` : "", requestId ? `request-id:${requestId};` : "", ts ? `ts:${ts};` : ""].join("");
}

export type ResultadoFirma = { valida: boolean; motivo?: string };

export async function verificarFirma(o: {
  secreto: string; cabeceraFirma: string | null; requestId: string | null; dataId: string; ahoraMs: number; toleranciaMs?: number;
}): Promise<ResultadoFirma> {
  if (!o.secreto) return { valida: false, motivo: "sin_secreto" };
  if (!o.cabeceraFirma) return { valida: false, motivo: "sin_cabecera" };
  const partes = Object.fromEntries(o.cabeceraFirma.split(",").map((p) => { const i = p.indexOf("="); return [p.slice(0, i).trim(), p.slice(i + 1).trim()]; }));
  const ts = partes["ts"], v1 = partes["v1"];
  if (!ts || !v1 || !/^\d+$/.test(ts) || !/^[a-f0-9]{64}$/.test(v1)) return { valida: false, motivo: "formato" };
  const tsMs = Number(ts) < 1e12 ? Number(ts) * 1000 : Number(ts);
  const tolerancia = o.toleranciaMs ?? 10 * 60 * 1000; // política propia: rechaza avisos repetidos fuera de ventana
  if (Math.abs(o.ahoraMs - tsMs) > tolerancia) return { valida: false, motivo: "fuera_de_ventana" };
  const esperado = await hmacSha256Hex(o.secreto, construirManifest(o.dataId, o.requestId ?? "", ts));
  return iguales(esperado, v1) ? { valida: true } : { valida: false, motivo: "no_coincide" };
}

const redondear = (n: number): number => Math.round(n * 100) / 100;

export async function crearPreferencia(cfg: ConfigMP, orden: Orden, token: string, f: Fetch = fetch): Promise<Preferencia> {
  if (!Number.isFinite(orden.monto_pen) || orden.monto_pen <= 0 || orden.monto_pen > 100000) throw new Error("monto_invalido");
  const volver = `${cfg.siteUrl}/pagar/resultado?o=${encodeURIComponent(orden.id)}&t=${encodeURIComponent(token)}`;
  const cuerpo = {
    items: [{ id: orden.servicio_id, title: orden.descripcion.slice(0, 120), quantity: 1, unit_price: redondear(orden.monto_pen), currency_id: "PEN" }],
    external_reference: orden.id,
    notification_url: `${cfg.siteUrl}/api/pagos/webhook`,
    back_urls: { success: volver, failure: volver, pending: volver },
    auto_return: "approved",
    statement_descriptor: "THREE3",
  };
  const r = await f(`${API}/checkout/preferences`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.accessToken}`, "Content-Type": "application/json", "X-Idempotency-Key": `pref-${orden.id}` },
    body: JSON.stringify(cuerpo),
  });
  if (!r.ok) throw new Error(`mp_preferencia_${r.status}`);
  const j = (await r.json()) as { id: string; init_point: string; sandbox_init_point?: string };
  return { id: j.id, init_point: cfg.sandbox && j.sandbox_init_point ? j.sandbox_init_point : j.init_point };
}

/** La verdad del pago se consulta siempre a Mercado Pago desde el servidor; nunca se confía en el cuerpo del aviso. */
export async function obtenerPago(cfg: ConfigMP, id: string, f: Fetch = fetch): Promise<PagoProveedor> {
  if (!/^\d{1,20}$/.test(id)) throw new Error("id_pago_invalido");
  const r = await f(`${API}/v1/payments/${id}`, { headers: { Authorization: `Bearer ${cfg.accessToken}` } });
  if (!r.ok) throw new Error(`mp_pago_${r.status}`);
  const j = (await r.json()) as Record<string, unknown>;
  return {
    id: String(j["id"]), status: String(j["status"]), transaction_amount: Number(j["transaction_amount"]),
    currency_id: String(j["currency_id"]), external_reference: String(j["external_reference"] ?? ""), payment_method_id: String(j["payment_method_id"] ?? ""),
  };
}
