/** Mercado Pago solo cobra de verdad si el dueño lo aprobó explícitamente: dos variables, no una. */
export function modoMercadoPago(env: { MP_MODO?: string; MP_PRODUCCION_APROBADA?: string }): "prueba" | "produccion" {
  return env.MP_MODO === "produccion" && env.MP_PRODUCCION_APROBADA === "si" ? "produccion" : "prueba";
}
