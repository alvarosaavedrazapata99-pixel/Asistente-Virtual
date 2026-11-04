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

const pen = (n: number) => `S/ ${n.toLocaleString("en-US")}`;
export const soles = pen;

/** Opciones del formulario y de /ig: el diagnóstico primero, luego los planes y los servicios creativos. */
export type Opcion = { id: string; nombre: string; resumen: string };
const creativos = servicios.filter((s) => s.categoria === "creativo" && s.id !== "personaje-completo");
export const opciones: Opcion[] = [
  { id: "diagnostico", nombre: "Diagnóstico gratis", resumen: "20 a 30 minutos para entender tu negocio y proponerte un plan." },
  ...planes.map((p) => ({ id: p.id, nombre: p.modulo ? p.nombre : `Plan ${p.nombre}`, resumen: p.resumen })),
  ...creativos.map((s) => ({ id: s.id, nombre: s.nombre, resumen: s.resumen })),
];

/** Mensaje inicial de WhatsApp. No contiene datos personales. */
export const MENSAJE_DIAGNOSTICO = "Hola THREE3, quiero agendar mi diagnóstico gratis de 20 a 30 minutos.";

/** Enlace de WhatsApp con mensaje inicial. Devuelve "" mientras no haya número configurado. */
export function enlaceWhatsApp(mensaje: string = MENSAJE_DIAGNOSTICO): string {
  const numero = empresa.whatsapp.replace(/\D/g, "");
  return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}` : "";
}
