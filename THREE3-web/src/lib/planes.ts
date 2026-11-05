import config from "@/config/planes.config.json";
import empresa from "@/config/empresa.config.json";
import { servicios } from "@/lib/services";

export type Plan = {
  id: string;
  nombre: string;
  inicial: number;
  mensual: number;
  resumen: string;
  destacado?: boolean;
  modulo?: boolean;
};

export const planes: Plan[] = config.planes;
export const mensualidadIncluye: string[] = config.mensualidad_incluye;
export const ACLARACION: string = config.aclaracion;
/** "bajo_clic": el precio se despliega con «Ver inversión». "abierto": siempre visible. */
export const PRECIOS_BAJO_CLIC: boolean = config.mostrar_precios !== "abierto";

const pen = (n: number) => `S/ ${n.toLocaleString("en-US")}`;
export const soles = pen;

/** Opciones del formulario y de /ig: el diagnóstico primero, luego los planes y los servicios creativos. */
export type Opcion = { id: string; nombre: string; resumen: string };
const creativos = servicios.filter((s) => s.categoria === "creativo" && s.id !== "personaje-completo");
export const opciones: Opcion[] = [
  { id: "diagnostico", nombre: "Diagnóstico gratis", resumen: "Diagnóstico automático de 3 minutos para entender tu negocio y sugerirte un plan." },
  ...planes.map((p) => ({ id: p.id, nombre: p.modulo ? p.nombre : `Plan ${p.nombre}`, resumen: p.resumen })),
  ...creativos.map((s) => ({ id: s.id, nombre: s.nombre, resumen: s.resumen })),
];

/** Mensaje inicial de WhatsApp. No contiene datos personales. */
export const MENSAJE_DIAGNOSTICO = "Hola THREE3, hice el diagnóstico en su web y quiero conversar.";

/** Enlace de WhatsApp con mensaje inicial. Devuelve "" mientras no haya número o `whatsapp_activo` sea false (entonces el botón abre el formulario). */
export function enlaceWhatsApp(mensaje: string = MENSAJE_DIAGNOSTICO): string {
  if (!empresa.whatsapp_activo) return "";
  const numero = empresa.whatsapp.replace(/\D/g, "");
  return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}` : "";
}
