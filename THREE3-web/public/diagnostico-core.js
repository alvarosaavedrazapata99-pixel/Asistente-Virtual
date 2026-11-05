/* Motor del diagnóstico automático de THREE3. Mismo archivo en el navegador (window.DIAG) y en el servidor (import),
   así el visitante ve el resultado al instante y el servidor lo recalcula antes de guardarlo (no confía en el navegador).
   Las cifras son ESTIMACIONES ORIENTATIVAS a partir de lo que responde la persona; no son una promesa de resultados. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DIAG = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var G1 = "Comercio y servicios", G2 = "Salud, bienestar y educación", G3 = "Empresas y servicios profesionales";

  // id = misma clave que la demo (public/demo.js). dolores: problemas típicos de ese rubro (se elige hasta 3).
  var RUBROS = [
    { id: "restaurante", etiqueta: "Restaurante", grupo: G1, dolores: ["Reservas que se pierden o se confunden", "Las mismas preguntas de carta y horarios todo el día", "Pedidos por WhatsApp desordenados", "No sé quiénes son mis clientes frecuentes"] },
    { id: "ropa", etiqueta: "Tienda de ropa", grupo: G1, dolores: ["Preguntas repetidas de tallas y stock", "Pedidos por Instagram y WhatsApp desordenados", "Clientes que preguntan y no compran", "Seguimiento de pedidos y cambios"] },
    { id: "tiendavirtual", etiqueta: "Tienda virtual (WhatsApp, TikTok, Instagram)", grupo: G1, dolores: ["Pierdo ventas por no responder a tiempo", "Pedidos y pagos en chats sueltos", "Clientes que preguntan el precio y desaparecen", "No tengo catálogo ni stock ordenado"] },
    { id: "hotel", etiqueta: "Hotel", grupo: G1, dolores: ["Consultas de disponibilidad a toda hora", "Cotizaciones de grupos y eventos lentas", "Reservas por varios canales sin orden", "Preguntas repetidas de servicios y ubicación"] },
    { id: "viajes", etiqueta: "Agencia de viajes", grupo: G1, dolores: ["Cotizaciones que tardan y se enfrían", "Preguntas repetidas de destinos y documentos", "Clientes que dijeron «luego» y no se les da seguimiento", "Información dispersa entre chats y correos"] },
    { id: "eventos", etiqueta: "Eventos y banquetes", grupo: G1, dolores: ["Cotizaciones largas y lentas", "Fechas que se cruzan o no se separan", "Clientes indecisos sin seguimiento", "Preguntas repetidas de menús y capacidad"] },
    { id: "dental", etiqueta: "Clínica dental", grupo: G2, dolores: ["Citas que se cancelan sin aviso", "Pacientes que preguntan precios y no vuelven", "Recordatorios de cita hechos a mano", "Urgencias que llegan fuera de horario"] },
    { id: "clinica", etiqueta: "Clínica y laboratorio", grupo: G2, dolores: ["Citas y reprogramaciones manuales", "Consultas administrativas repetidas", "Cobertura de seguros por confirmar siempre", "Llamadas que saturan la recepción"] },
    { id: "veterinaria", etiqueta: "Veterinaria", grupo: G2, dolores: ["Recordatorios de vacunas que se olvidan", "Urgencias fuera de horario", "Citas desordenadas", "Preguntas repetidas de servicios"] },
    { id: "gimnasio", etiqueta: "Gimnasio", grupo: G2, dolores: ["Prospectos que preguntan precio y no se inscriben", "Renovaciones de membresía olvidadas", "Horarios y clases por consultar siempre", "Visitantes sin seguimiento"] },
    { id: "academia", etiqueta: "Colegio y academia", grupo: G2, dolores: ["Consultas de admisión fuera de horario", "Familias interesadas sin seguimiento", "Preguntas repetidas de pensiones y requisitos", "Visitas guiadas por coordinar"] },
    { id: "inmobiliaria", etiqueta: "Inmobiliaria", grupo: G3, dolores: ["Contactos de portales sin seguimiento", "Consultas fuera de horario", "Visitas difíciles de coordinar", "Clientes serios mezclados con curiosos"] },
    { id: "contable", etiqueta: "Estudio contable", grupo: G3, dolores: ["Clientes que preguntan lo mismo cada mes", "Recordatorios de vencimientos manuales", "Prospectos sin calificar", "Documentos que llegan por chats sueltos"] },
    { id: "juridico", etiqueta: "Estudio jurídico", grupo: G3, dolores: ["Consultas iniciales que consumen mucho tiempo", "Prospectos sin calificar por urgencia", "Seguimiento de casos y plazos", "Información por canales poco ordenados"] },
    { id: "constructora", etiqueta: "Constructora", grupo: G3, dolores: ["Cotizaciones lentas y desordenadas", "Seguimiento a clientes de obra", "Consultas repetidas de plazos y garantías", "Información de proyectos dispersa"] },
    { id: "logistica", etiqueta: "Logística y transporte", grupo: G3, dolores: ["Cotizaciones de envío lentas", "Consultas manuales de seguimiento de guías", "Clientes recurrentes sin seguimiento", "Atención dividida entre llamadas y chats"] },
    { id: "software", etiqueta: "Software B2B", grupo: G3, dolores: ["Solicitudes de demo sin calificar", "Soporte básico repetitivo", "Pruebas gratuitas sin seguimiento", "Datos de clientes en varias herramientas"] },
    { id: "instituto", etiqueta: "Capacitación corporativa", grupo: G3, dolores: ["Consultas corporativas sin seguimiento", "Propuestas por grupo lentas", "Preguntas repetidas de programas y modalidades", "Inscripciones manuales"] },
    { id: "ferreteria", etiqueta: "Ferretería industrial", grupo: G3, dolores: ["Cotizaciones de materiales lentas", "Clientes recurrentes sin seguimiento", "Consultas repetidas de stock", "Pedidos por varios canales"] },
    { id: "autos", etiqueta: "Concesionaria y taller", grupo: G3, dolores: ["Interesados en prueba de manejo sin seguimiento", "Recordatorios de mantenimiento", "Consultas repetidas de financiamiento", "Clientes de flota sin ejecutivo asignado"] },
    { id: "seguros", etiqueta: "Corredora de seguros", grupo: G3, dolores: ["Cotizaciones que se enfrían", "Renovaciones olvidadas", "Consultas repetidas de coberturas", "Seguimiento a clientes de empresas"] },
    { id: "pasteleria", etiqueta: "Pastelería", grupo: G1, dolores: ["Pedidos que se pierden en chats", "Preguntas repetidas de sabores y precios", "Fechas que se cruzan", "Clientes que no confirman"] },
    { id: "muebles", etiqueta: "Muebles y decoración", grupo: G1, dolores: ["Cotizaciones lentas", "Clientes que preguntan y desaparecen", "Medidas y pedidos por chats sueltos", "Seguimiento de entregas"] },
    { id: "estetica", etiqueta: "Cirugía plástica y estética", grupo: G2, dolores: ["Consultas de precio sin agendar evaluación", "Pacientes que no vuelven tras preguntar", "Citas que se cancelan", "Seguimiento posterior a tratamientos"] },
    { id: "salon", etiqueta: "Salón de belleza y spa", grupo: G2, dolores: ["Citas por mensaje desordenadas", "Clientas que no llegan sin recordatorio", "Preguntas repetidas de precios", "Horarios llenos y vacíos mal repartidos"] },
    { id: "psicologia", etiqueta: "Psicología y terapia", grupo: G2, dolores: ["Citas y reprogramaciones manuales", "Consultas fuera de horario", "Primeras sesiones sin confirmar", "Información por canales sueltos"] },
    { id: "optica", etiqueta: "Óptica y optometría", grupo: G2, dolores: ["Preguntas repetidas de precios y plazos", "Exámenes sin agendar", "Recordatorios de controles", "Pedidos de lentes por chats sueltos"] },
    { id: "arquitectura", etiqueta: "Arquitectura y diseño", grupo: G3, dolores: ["Cotizaciones lentas", "Prospectos sin calificar", "Seguimiento a propuestas enviadas", "Información de proyectos dispersa"] },
    { id: "marketing", etiqueta: "Agencia de marketing", grupo: G3, dolores: ["Prospectos sin calificar", "Propuestas que se enfrían", "Preguntas repetidas de servicios", "Reportes manuales a clientes"] },
    { id: "otro", etiqueta: "Otro rubro", grupo: G3, dolores: ["Preguntas repetidas de clientes", "Consultas fuera de horario", "Interesados sin seguimiento", "Información dispersa entre chats"] },
  ];

  // Preguntas comunes. v = peso para el cálculo (ver evaluar). "varias" permite marcar más de una opción.
  var PREGUNTAS = [
    { id: "canales", texto: "¿Por dónde te escriben tus clientes?", tipo: "varias", max: 7, opciones: [
      { id: "whatsapp", texto: "WhatsApp" }, { id: "instagram", texto: "Instagram" }, { id: "tiktok", texto: "TikTok" }, { id: "facebook", texto: "Facebook" },
      { id: "web", texto: "Mi página web" }, { id: "llamadas", texto: "Llamadas" }, { id: "presencial", texto: "En persona" }] },
    { id: "consultas", texto: "¿Cuántas consultas recibes al mes, aproximadamente?", tipo: "una", opciones: [
      { id: "c1", texto: "Menos de 50", v: 25 }, { id: "c2", texto: "50 a 200", v: 125 }, { id: "c3", texto: "200 a 1000", v: 600 }, { id: "c4", texto: "Más de 1000", v: 1500 }] },
    { id: "respuesta", texto: "¿Cuánto tardas en responder normalmente?", tipo: "una", opciones: [
      { id: "r1", texto: "Al instante (menos de 5 minutos)" }, { id: "r2", texto: "En menos de 1 hora" }, { id: "r3", texto: "En varias horas" }, { id: "r4", texto: "Al día siguiente o más" }] },
    { id: "fuera", texto: "¿Qué pasa con los mensajes fuera de tu horario?", tipo: "una", opciones: [
      { id: "f1", texto: "Los respondemos igual" }, { id: "f2", texto: "Se responden al día siguiente" }, { id: "f3", texto: "Muchos se pierden" }] },
    { id: "registro", texto: "¿Cómo anotas a tus clientes interesados?", tipo: "una", opciones: [
      { id: "g1", texto: "En un CRM o sistema" }, { id: "g2", texto: "En una hoja de cálculo" }, { id: "g3", texto: "En cuaderno o en el mismo chat" }, { id: "g4", texto: "No los anoto" }] },
    { id: "atiende", texto: "¿Quién atiende las consultas?", tipo: "una", opciones: [
      { id: "a1", texto: "Yo mismo" }, { id: "a2", texto: "Una o dos personas" }, { id: "a3", texto: "Un equipo o área" }] },
    { id: "dolores", texto: "¿Qué te pasa hoy? Elige hasta 3", tipo: "varias", max: 3, delRubro: true },
    { id: "meta", texto: "¿Qué quieres lograr primero?", tipo: "una", opciones: [
      { id: "m1", texto: "Responder más rápido" }, { id: "m2", texto: "Captar más clientes" }, { id: "m3", texto: "Ordenar y hacer seguimiento" }, { id: "m4", texto: "Ahorrar tiempo de mi equipo" }] },
    { id: "urgencia", texto: "¿Cuándo te gustaría empezar?", tipo: "una", opciones: [
      { id: "u1", texto: "Este mes" }, { id: "u2", texto: "En 1 a 3 meses" }, { id: "u3", texto: "Solo estoy explorando" }] },
    { id: "inversion", texto: "¿Qué inversión mensual tienes en mente para esto?", tipo: "una", opciones: [
      { id: "i1", texto: "Aún no lo he pensado" }, { id: "i2", texto: "Hasta S/ 500" }, { id: "i3", texto: "S/ 500 a 1000" }, { id: "i4", texto: "Más de S/ 1000" }] },
    { id: "decide", texto: "¿Tú decides la contratación?", tipo: "una", opciones: [
      { id: "d1", texto: "Sí, yo decido" }, { id: "d2", texto: "Con otra persona" }, { id: "d3", texto: "Solo estoy investigando" }] },
  ];

  function rubro(id) { for (var i = 0; i < RUBROS.length; i++) if (RUBROS[i].id === id) return RUBROS[i]; return null; }
  function pregunta(id) { for (var i = 0; i < PREGUNTAS.length; i++) if (PREGUNTAS[i].id === id) return PREGUNTAS[i]; return null; }
  function opcionesDe(p, r) {
    if (!p.delRubro) return p.opciones;
    return r.dolores.map(function (t, i) { return { id: "x" + i, texto: t }; });
  }
  function opcion(p, r, id) { var o = opcionesDe(p, r); for (var i = 0; i < o.length; i++) if (o[i].id === id) return o[i]; return null; }

  /** ¿Las respuestas son completas y de opciones que existen? Devuelve null si están bien, o el id de la pregunta con problema. */
  function validar(rubroId, resp) {
    var r = rubro(rubroId);
    if (!r) return "rubro";
    if (!resp || typeof resp !== "object") return "respuestas";
    for (var i = 0; i < PREGUNTAS.length; i++) {
      var p = PREGUNTAS[i], v = resp[p.id];
      if (p.tipo === "una") { if (typeof v !== "string" || !opcion(p, r, v)) return p.id; }
      else {
        if (!Array.isArray(v) || v.length < 1 || v.length > p.max) return p.id;
        var vistos = {};
        for (var j = 0; j < v.length; j++) { if (typeof v[j] !== "string" || !opcion(p, r, v[j]) || vistos[v[j]]) return p.id; vistos[v[j]] = 1; }
      }
    }
    return null;
  }

  var mapa = function (obj, k, def) { return obj[k] === undefined ? def : obj[k]; };

  /** Calcula el diagnóstico. Todo sale de las respuestas; nada se inventa. */
  function evaluar(rubroId, resp) {
    var r = rubro(rubroId), q = {};
    for (var i = 0; i < PREGUNTAS.length; i++) q[PREGUNTAS[i].id] = pregunta(PREGUNTAS[i].id);
    var digitales = resp.canales.filter(function (c) { return c !== "llamadas" && c !== "presencial"; }).length;
    var vol = q.consultas.opciones.filter(function (o) { return o.id === resp.consultas; })[0].v;

    // Nivel de automatización actual (0 a 100): cuánto de la atención ya está ordenada y a tiempo.
    var madurez = mapa({ r1: 25, r2: 18, r3: 8, r4: 0 }, resp.respuesta, 0)
      + mapa({ f1: 20, f2: 8, f3: 0 }, resp.fuera, 0)
      + mapa({ g1: 25, g2: 15, g3: 6, g4: 0 }, resp.registro, 0)
      + (digitales >= 3 ? 15 : digitales === 2 ? 10 : digitales === 1 ? 5 : 0)
      + mapa({ a3: 15, a2: 10, a1: 5 }, resp.atiende, 5);
    madurez = Math.max(0, Math.min(100, madurez));

    // Porcentaje orientativo de consultas que podrían quedar sin atender a tiempo.
    var pct = mapa({ r1: 0.03, r2: 0.08, r3: 0.15, r4: 0.25 }, resp.respuesta, 0.1)
      + mapa({ f1: 0, f2: 0.05, f3: 0.12 }, resp.fuera, 0)
      + (resp.registro === "g4" ? 0.05 : resp.registro === "g3" ? 0.03 : 0);
    pct = Math.max(0.03, Math.min(0.4, pct));
    var perdidas = Math.round(vol * pct);

    // Complejidad → plan sugerido
    var nivelVol = { c1: 0, c2: 1, c3: 2, c4: 3 }[resp.consultas];
    var complejidad = nivelVol + (digitales >= 3 ? 2 : digitales === 2 ? 1 : 0) + (resp.atiende === "a3" ? 1 : 0) + (r.grupo === G3 ? 1 : 0) + (resp.meta === "m3" ? 1 : 0);
    var plan = complejidad >= 7 ? "plan-avanzado" : complejidad >= 4 ? "plan-profesional" : "plan-inicial";
    var modulo = resp.registro !== "g1" || resp.meta === "m3";

    // Mejoras rápidas, en orden de prioridad (siempre 3)
    var ganancias = [];
    if (resp.fuera !== "f1") ganancias.push("Un asistente que responda a toda hora: así ninguna consulta espera hasta el día siguiente.");
    if (resp.respuesta === "r3" || resp.respuesta === "r4") ganancias.push("Respuestas inmediatas a las preguntas frecuentes de tu negocio (horarios, servicios, ubicación) para liberar a tu equipo.");
    if (resp.registro === "g4" || resp.registro === "g3") ganancias.push("Registrar cada interesado de forma automática (nombre, contacto y qué necesita) para no perder seguimiento.");
    if (resp.registro === "g2") ganancias.push("Pasar de la hoja de cálculo a un CRM simple con estados: nuevo, contactado, cotizado y cliente.");
    resp.dolores.slice(0, 2).forEach(function (d) { var o = opcion(q.dolores, r, d); if (o) ganancias.push("Atacar «" + o.texto + "» con respuestas y recordatorios automáticos."); });
    if (resp.canales.indexOf("instagram") >= 0 || resp.canales.indexOf("tiktok") >= 0) ganancias.push("Conectar tus mensajes de Instagram y TikTok con tu registro de clientes: quien escribe o comenta queda anotado.");
    ganancias.push("Un reporte mensual con consultas, interesados y temas más preguntados.");
    ganancias = ganancias.slice(0, 3);

    // Interés (para que THREE3 sepa a quién llamar primero)
    var pts = mapa({ u1: 4, u2: 2, u3: 0 }, resp.urgencia, 0)
      + mapa({ i4: 3, i3: 3, i2: 2, i1: 0 }, resp.inversion, 0)
      + mapa({ d1: 3, d2: 1, d3: 0 }, resp.decide, 0)
      + (vol >= 125 ? 2 : 0);
    var nivel = pts >= 9 ? "muy" : pts >= 5 ? "interesado" : "explorando";

    return {
      rubro: r.id, rubroNombre: r.etiqueta, madurez: madurez, perdidaPct: Math.round(pct * 100), perdidas: perdidas, consultas: vol,
      plan: plan, modulo: modulo, ganancias: ganancias, interes: { nivel: nivel, puntos: pts },
      nota: "Estimación orientativa calculada con tus respuestas. No es una garantía de resultados.",
    };
  }

  var NIVEL_TEXTO = { muy: "Muy interesado", interesado: "Interesado", explorando: "Explorando" };
  return { RUBROS: RUBROS, PREGUNTAS: PREGUNTAS, rubro: rubro, pregunta: pregunta, opcionesDe: opcionesDe, validar: validar, evaluar: evaluar, NIVEL_TEXTO: NIVEL_TEXTO };
});
