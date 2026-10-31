import { puedePasar } from "./estados.ts";
import type { Almacen, Estado, NuevaOrden, Orden, PagoRegistro } from "./tipos.ts";

/** Almacén en memoria con la misma interfaz que el de producción. Se usa en pruebas. */
export function almacenMemoria() {
  const ordenes = new Map<string, Orden>();
  const eventos = new Set<string>();
  const pagos: PagoRegistro[] = [];
  const anomalias: { orden: string | null; tipo: string; detalle: unknown }[] = [];
  const historial: { id: string; de: Estado; a: Estado; motivo: string }[] = [];
  let n = 0;
  const a: Almacen = {
    async crearOrden(o: NuevaOrden) {
      const orden: Orden = { ...o, id: `ord_${String(++n).padStart(8, "0")}`, estado: "creado" };
      ordenes.set(orden.id, orden);
      return { ...orden };
    },
    async obtenerOrden(id) { const o = ordenes.get(id); return o ? { ...o } : null; },
    async cambiarEstado(id, de, a2, motivo) {
      const o = ordenes.get(id);
      if (!o || o.estado !== de || !puedePasar(de, a2)) return false;
      o.estado = a2; historial.push({ id, de, a: a2, motivo });
      return true;
    },
    async registrarEvento(prov, ev) { const k = `${prov}|${ev}`; if (eventos.has(k)) return false; eventos.add(k); return true; },
    async registrarPago(p) { pagos.push(p); },
    async registrarAnomalia(orden, tipo, detalle) { anomalias.push({ orden, tipo, detalle }); },
  };
  return Object.assign(a, { ordenes, pagos, anomalias, historial });
}
