import type { Estado } from "./tipos.ts";

/** Máquina de estados del pedido (ADR 0001/flujos). Solo el servidor mueve estados. */
const TRANSICIONES: Record<Estado, Estado[]> = {
  creado: ["pagado", "fallido"],
  pagado: ["en_proceso", "reembolsado"],
  en_proceso: ["en_revision", "reembolsado"],
  en_revision: ["en_proceso", "entregado", "reembolsado"],
  entregado: ["cerrado"],
  cerrado: [],
  fallido: [],
  reembolsado: [],
};

export const puedePasar = (de: Estado, a: Estado): boolean => TRANSICIONES[de]?.includes(a) ?? false;

export function validarTransicion(de: Estado, a: Estado): void {
  if (!puedePasar(de, a)) throw new Error(`Transición no permitida: ${de} → ${a}`);
}
