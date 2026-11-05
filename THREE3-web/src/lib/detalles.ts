/** Páginas de detalle de "Mira cómo funciona". El bot con IA es el producto principal; 3D y videojuegos son servicios aparte. */
export type Detalle = {
  id: string;
  titulo: string;
  corto: string;
  etiqueta: string;
  aparte: boolean;
  lead: string;
  pasos: { t: string; d: string }[];
  incluye: string[];
  paraQuien: string;
  nota?: string;
  cta: string;
};

export const DETALLES: Detalle[] = [
  {
    id: "conecta",
    titulo: "Así se conecta",
    corto: "Del comentario en Instagram a la venta registrada",
    etiqueta: "Bot con IA",
    aparte: false,
    lead: "Tu bot no vive aislado: se conecta a los canales donde ya te escriben tus clientes y deja todo ordenado en un solo lugar.",
    pasos: [
      { t: "El cliente te escribe", d: "Por WhatsApp, por mensaje directo de Instagram, por un comentario con una palabra clave o desde tu página web." },
      { t: "El bot responde al instante", d: "Con la información de tu negocio: precios, horarios, ubicación y servicios. Se identifica como asistente virtual." },
      { t: "Califica al interesado", d: "Hace unas preguntas simples (qué busca, para cuándo, presupuesto aproximado) y mide su nivel de interés." },
      { t: "Queda registrado", d: "Nombre, celular y lo que pidió, sin duplicados, en tu CRM o en una hoja de Google." },
      { t: "Tú recibes el aviso", d: "Cuando alguien quiere comprar o reservar, te avisamos para que cierres la venta con una persona." },
    ],
    incluye: ["Conexión a WhatsApp, Instagram y tu web, según tu plan", "Registro de interesados con nivel de interés", "Aviso cuando alguien está listo para comprar", "Reporte mensual de conversaciones y ventas", "Hoja de Google («Excel maestro») en el plan Avanzado"],
    paraQuien: "Para cualquier negocio que reciba consultas por chat y hoy pierda clientes por responder tarde o no anotar a quien preguntó.",
    nota: "WhatsApp exige una verificación de Meta. Te acompañamos en el trámite y te avisamos en qué estado está. Mientras tanto puedes empezar por la web o Instagram.",
    cta: "Hacer mi diagnóstico gratis",
  },
  {
    id: "personaje",
    titulo: "Tri nace en Blender",
    corto: "Del boceto al render de un personaje 3D",
    etiqueta: "Servicio aparte",
    aparte: true,
    lead: "Un personaje original para tu marca, en estilo juguete 3D. Puede ser la mascota de tu bot, de tus redes o de tus videos.",
    pasos: [
      { t: "Briefing", d: "Nos cuentas el concepto, el estilo y dónde lo vas a usar. Sin marcas ni personajes de terceros." },
      { t: "Boceto en blanco y negro", d: "Apruebas la forma antes de modelar: antena, accesorios y expresiones." },
      { t: "Modelado y texturas", d: "Lo construimos en Blender con los colores de tu marca." },
      { t: "Render y entrega", d: "Imágenes y archivos listos para redes, web o video, con licencia escrita." },
    ],
    incluye: ["Boceto aprobado por ti", "Modelo 3D y renders finales", "Licencia escrita con su alcance de uso", "Poses o expresiones extra, si las cotizas"],
    paraQuien: "Para marcas que quieren una mascota propia que las distinga, sola o junto a su bot.",
    nota: "Es un servicio independiente del bot. Se cotiza según la complejidad del personaje y lo que necesites entregar.",
    cta: "Cotizar un personaje 3D",
  },
  {
    id: "juego",
    titulo: "Crea tu videojuego",
    corto: "Un juego propio para tu marca",
    etiqueta: "Servicio aparte",
    aparte: true,
    lead: "Desarrollo de software a medida: un videojuego con tu marca o tu personaje, pensado para que la gente juegue, comparta y vuelva.",
    pasos: [
      { t: "Idea y objetivo", d: "Definimos para qué lo quieres: promoción, lanzamiento, fidelizar clientes o entretenimiento." },
      { t: "Diseño del juego", d: "Mecánica, reglas, niveles y estilo visual, usando tu marca o tu personaje 3D." },
      { t: "Prototipo jugable", d: "Una primera versión para probar la idea antes de pulir todo." },
      { t: "Desarrollo y pruebas", d: "Programación, arte y sonido, con pruebas en celular y computadora." },
      { t: "Publicación", d: "Lo dejamos funcionando en web o en el canal que acordemos." },
    ],
    incluye: ["Juego web o para celular, según el alcance", "Con tu marca o tu personaje 3D", "Posibilidad de premios o sorteos, con bases legales aparte", "Medición de cuántas personas juegan"],
    paraQuien: "Para marcas, tiendas, eventos y campañas que quieren una experiencia propia en lugar de una publicación más.",
    nota: "Es un servicio independiente del bot. Cada proyecto se cotiza por escrito con alcance, plazo y precio antes de empezar.",
    cta: "Cotizar un videojuego",
  },
  {
    id: "idiomas",
    titulo: "Tri habla tu idioma",
    corto: "Mensajes en varios idiomas para clientes de toda la región",
    etiqueta: "Bot con IA",
    aparte: false,
    lead: "Tu bot puede atender a cada cliente en su idioma, con la misma información de tu negocio.",
    pasos: [
      { t: "Detecta el idioma", d: "Responde en el idioma en que le escribe el cliente." },
      { t: "Usa tu información", d: "Precios, horarios y servicios de tu negocio, sin inventar datos." },
      { t: "Registra al interesado", d: "Igual que en cualquier otro idioma: contacto, qué busca y su nivel de interés." },
      { t: "Pasa a una persona", d: "Cuando hace falta una conversación real, te avisa y tú continúas." },
    ],
    incluye: ["Atención en español y en otros idiomas según tu plan", "Reportes con el idioma de cada consulta", "Mismas reglas de seguridad y de identificación como asistente virtual"],
    paraQuien: "Para turismo, hoteles, comercio exterior y negocios con clientes de varios países.",
    nota: "Varios idiomas están incluidos en el plan Avanzado. En otros planes se pueden sumar; lo definimos en el diagnóstico.",
    cta: "Hacer mi diagnóstico gratis",
  },
];

export const detallePorId = (id: string) => DETALLES.find((d) => d.id === id);
