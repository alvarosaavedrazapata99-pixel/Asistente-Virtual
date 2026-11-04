import config from "@/config/services.config.json";

/** Precios, plazos y moneda salen del archivo oficial; textos y videos, del catálogo de presentación. */
type FilaConfig = {
  id: string;
  nombre: string;
  desde_pen: number;
  mensual_pen?: number;
  entrega: string;
  nota?: string;
  publicar: boolean;
};
const cfg = config as unknown as { tipo_cambio_usd: number; servicios: FilaConfig[] };

type Catalogo = {
  nombre: string;
  resumen: string;
  incluye: string[];
  nota?: string;
  video: string;
  categoria: "automatizacion" | "creativo";
  destacado?: boolean;
  ancho?: boolean;
};

const catalogo: Record<string, Catalogo> = {
  sheets: {
    categoria: "automatizacion",
    nombre: "Base maestra en Sheets",
    resumen: "Tus datos ordenados en una hoja lista para analizar y conectar.",
    incluye: ["Plantilla a tu cuenta", "Fórmulas y totales", "Guía de uso"],
    video: "svc_sheets",
  },
  leads: {
    categoria: "automatizacion",
    nombre: "Captación de leads",
    resumen: "Formularios y flujos que guardan cada interesado y le dan seguimiento.",
    incluye: ["Formulario y flujo", "Aviso inmediato", "Envío al CRM"],
    video: "svc_leads",
  },
  crm: {
    categoria: "automatizacion",
    nombre: "CRM",
    resumen: "Todos tus contactos, ventas y seguimientos en un solo tablero.",
    incluye: ["Pipeline de ventas", "Recordatorios", "Reporte semanal"],
    video: "svc_crm",
  },
  chatbot: {
    categoria: "automatizacion",
    nombre: "Chatbot web + WhatsApp",
    resumen: "Responde a tus clientes en WhatsApp y en tu web con tu información.",
    incluye: ["Base de conocimiento", "Web + WhatsApp", "Traspaso a una persona"],
    nota: "Los costos de WhatsApp (Meta) y de IA van aparte, según el volumen.",
    video: "svc_chatbot",
  },
  "pack-automatiza": {
    categoria: "automatizacion",
    nombre: "Pack Chatbot + CRM + Leads",
    resumen: "El flujo completo: de Instagram o tu web a la venta registrada, todo conectado.",
    incluye: ["Chatbot web + WhatsApp", "CRM con pipeline", "Captación de leads al CRM"],
    video: "svc_conecta",
    destacado: true,
    ancho: true,
  },
  "personaje-basico": {
    categoria: "creativo",
    nombre: "Personaje 3D básico",
    resumen: "Mascota original en estilo juguete 3D con boceto, render y licencia.",
    incluye: ["Boceto en blanco y negro", "Render y turntable 360", "Licencia comercial PDF"],
    video: "svc_personaje",
  },
  "personaje-completo": {
    categoria: "creativo",
    nombre: "Personaje 3D completo",
    resumen: "Tu personaje listo para animar y usar en web o juegos.",
    incluye: ["Todo lo del básico", "Rig y expresiones", "Modelo GLB para web y juegos"],
    video: "svc_personaje",
  },
  videojuego: {
    categoria: "creativo",
    nombre: "Videojuego a medida",
    resumen: "Un juego web de alcance cerrado para tu marca, revisado por una persona.",
    incluye: ["Juego web jugable", "Revisión humana", "Licencia de uso"],
    nota: "Alcance cerrado y revisión humana antes de entregar.",
    video: "svc_juego",
  },
};

export type Servicio = {
  id: string;
  nombre: string;
  resumen: string;
  incluye: string[];
  nota?: string;
  video: string;
  categoria: "automatizacion" | "creativo";
  destacado: boolean;
  ancho: boolean;
  entrega: string;
  desdePen: number;
  desdeUsd: number;
  mensualPen?: number;
  publicar: boolean;
};

/** El orden del catálogo es el del archivo de configuración. */
export const servicios: Servicio[] = cfg.servicios.map((s) => {
  const c = catalogo[s.id];
  if (!c) throw new Error(`Falta presentación para el servicio "${s.id}"`);
  return {
    id: s.id,
    nombre: c.nombre,
    resumen: c.resumen,
    incluye: c.incluye,
    nota: c.nota,
    video: c.video,
    categoria: c.categoria,
    destacado: !!c.destacado,
    ancho: !!c.ancho,
    entrega: s.entrega.replace(/\bdias\b/g, "días"),
    desdePen: s.desde_pen,
    desdeUsd: Math.round(s.desde_pen / cfg.tipo_cambio_usd),
    mensualPen: s.mensual_pen,
    publicar: s.publicar,
  };
});

/** false = el panel dice "Cotizar" y no muestra montos. Activar solo con precios validados (3 cotizaciones). */
export const MOSTRAR_PRECIO_EJEMPLO = false;

export const INSTAGRAM_URL = "https://www.instagram.com/three_3agency/";
export const INSTAGRAM_DM = "https://ig.me/m/three_3agency";

const pen = (n: number) => `S/ ${n.toLocaleString("en-US")}`;

export const textoDesde = (s: Servicio) => pen(s.desdePen);
export const textoUsd = (s: Servicio) => `≈ US$ ${s.desdeUsd.toLocaleString("en-US")}`;
export const textoMensual = (s: Servicio) => (s.mensualPen ? `Mantenimiento desde ${pen(s.mensualPen)}/mes` : "");

/** Pie de tarjeta: "Cotizar" mientras publicar=false. */
export const etiquetaPrecio = (s: Servicio) => (s.publicar ? `Desde ${pen(s.desdePen)}` : "Cotizar");
