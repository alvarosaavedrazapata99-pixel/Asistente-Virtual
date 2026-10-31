declare const LEADS: {
  SERVICIOS: string[];
  normEmail(v: unknown): string;
  normCel(v: unknown): string;
  normTexto(v: unknown): string;
  claveSolicitud(idContacto: string, servicioId: string, iso: string): string;
  procesar(store: unknown, p: Record<string, unknown>, iso: string): { estado: string; motivo?: string };
};
export default LEADS;
