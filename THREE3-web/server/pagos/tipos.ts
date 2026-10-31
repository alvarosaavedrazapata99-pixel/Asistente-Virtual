/** Tipos compartidos del módulo de pagos. Solo sintaxis que Node puede ejecutar sin compilar. */
export type Estado = "creado" | "pagado" | "en_proceso" | "en_revision" | "entregado" | "cerrado" | "fallido" | "reembolsado";

export type Orden = {
  id: string;
  token_hash: string;
  servicio_id: string;
  descripcion: string;
  monto_pen: number;
  estado: Estado;
};

export type NuevaOrden = Omit<Orden, "id" | "estado">;

export type PagoRegistro = {
  proveedor: string;
  pago_externo_id: string;
  orden_id: string;
  estado_proveedor: string;
  monto: number;
  moneda: string;
  metodo: string;
};

/** Persistencia. Hay una versión en memoria (pruebas) y otra sobre Supabase/PostgREST. */
export interface Almacen {
  crearOrden(o: NuevaOrden): Promise<Orden>;
  obtenerOrden(id: string): Promise<Orden | null>;
  /** Cambia el estado solo si sigue en `de` (control optimista). Devuelve false si ya cambió. */
  cambiarEstado(id: string, de: Estado, a: Estado, motivo: string): Promise<boolean>;
  /** false = el evento ya se había recibido (idempotencia). */
  registrarEvento(proveedor: string, eventoId: string, payload: unknown): Promise<boolean>;
  registrarPago(p: PagoRegistro): Promise<void>;
  registrarAnomalia(ordenId: string | null, tipo: string, detalle: unknown): Promise<void>;
}

export type PagoProveedor = {
  id: string;
  status: string;
  transaction_amount: number;
  currency_id: string;
  external_reference: string;
  payment_method_id: string;
};

export type Preferencia = { id: string; init_point: string };
