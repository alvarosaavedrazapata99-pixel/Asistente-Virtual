import { obtenerPago, verificarFirma, type ConfigMP } from "./mercadopago.ts";
import { puedePasar } from "./estados.ts";
import type { Almacen } from "./tipos.ts";

export type Resultado = { status: number; accion: string };

type Dep = { almacen: Almacen; mp: ConfigMP; fetch?: typeof fetch; ahora?: () => number };

const ID_ORDEN = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Procesa un aviso de Mercado Pago. Orden de defensa:
 * firma → consulta del pago al proveedor → idempotencia → coincidencia de orden, monto y moneda → transición de estado.
 * Devuelve 200 cuando el aviso no debe reintentarse y 5xx cuando sí.
 */
export async function procesarAviso(dep: Dep, url: URL, h: Headers, cuerpo: unknown): Promise<Resultado> {
  const b = (cuerpo ?? {}) as { type?: string; data?: { id?: string | number } };
  const dataId = String(url.searchParams.get("data.id") ?? b.data?.id ?? "");
  const tipo = url.searchParams.get("type") ?? b.type ?? "";

  const firma = await verificarFirma({
    secreto: dep.mp.webhookSecret, cabeceraFirma: h.get("x-signature"), requestId: h.get("x-request-id"), dataId, ahoraMs: (dep.ahora ?? Date.now)(),
  });
  if (!firma.valida) {
    await dep.almacen.registrarAnomalia(null, "firma_invalida", { motivo: firma.motivo });
    return { status: 401, accion: "firma_invalida" };
  }
  if (tipo !== "payment") return { status: 200, accion: "ignorado" };

  let pago;
  try {
    pago = await obtenerPago(dep.mp, dataId, dep.fetch);
  } catch {
    return { status: 502, accion: "proveedor_no_disponible" }; // Mercado Pago reintentará
  }

  if (!ID_ORDEN.test(pago.external_reference)) {
    await dep.almacen.registrarAnomalia(null, "referencia_invalida", { pago: pago.id });
    return { status: 200, accion: "orden_desconocida" };
  }
  const orden = await dep.almacen.obtenerOrden(pago.external_reference);
  if (!orden) {
    await dep.almacen.registrarAnomalia(null, "orden_desconocida", { pago: pago.id, ref: pago.external_reference });
    return { status: 200, accion: "orden_desconocida" };
  }

  const nuevo = await dep.almacen.registrarEvento("mercadopago", `${pago.id}:${pago.status}`, pago);
  if (!nuevo) return { status: 200, accion: "duplicado" };

  const montoOk = Math.abs(pago.transaction_amount - orden.monto_pen) < 0.005 && pago.currency_id === "PEN";
  if (!montoOk) {
    await dep.almacen.registrarAnomalia(orden.id, "monto_o_moneda", { esperado: orden.monto_pen, recibido: pago.transaction_amount, moneda: pago.currency_id });
    return { status: 200, accion: "monto_invalido" };
  }

  await dep.almacen.registrarPago({
    proveedor: "mercadopago", pago_externo_id: pago.id, orden_id: orden.id, estado_proveedor: pago.status,
    monto: pago.transaction_amount, moneda: pago.currency_id, metodo: pago.payment_method_id,
  });

  if (pago.status === "approved") {
    if (orden.estado === "creado") {
      const hecho = await dep.almacen.cambiarEstado(orden.id, "creado", "pagado", `mp:${pago.id}`);
      if (hecho) return { status: 200, accion: "pagado" };
    }
    // Llegó otro pago aprobado para una orden que ya estaba pagada: hay que devolver uno a mano.
    await dep.almacen.registrarAnomalia(orden.id, "pago_adicional", { pago: pago.id });
    return { status: 200, accion: "pago_adicional" };
  }
  if (pago.status === "refunded" || pago.status === "charged_back") {
    if (puedePasar(orden.estado, "reembolsado") && (await dep.almacen.cambiarEstado(orden.id, orden.estado, "reembolsado", `mp:${pago.id}:${pago.status}`))) {
      return { status: 200, accion: "reembolsado" };
    }
    return { status: 200, accion: "sin_cambio" };
  }
  // pending, in_process, rejected, cancelled: se registra el intento y la orden sigue abierta para reintentar.
  return { status: 200, accion: "registrado" };
}
