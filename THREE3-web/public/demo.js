/* Demostración simulada: todo ocurre en esta página; no se envía ni se guarda nada.
   Cada negocio de ejemplo (ficticio) tiene temas con respuestas, un flujo de calificación de varios pasos,
   prioridad del cliente y un valor estimado de ejemplo que alimentan el CRM y el reporte. */
(() => {
  const app = document.getElementById("demo-app");
  if (!app) return;
  const $ = (id) => document.getElementById(id);
  const log = $("demo-log"), chips = $("demo-chips"), form = $("demo-form"), entrada = $("demo-in"), etiqueta = $("demo-lbl");
  const libre = $("demo-libre"), libreIn = $("demo-libre-in");
  let ia = false; // se activa si el servidor informa que la demo con IA está encendida
  const hist = []; // conversación visible, para dar contexto a la IA
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // op(texto, puntos de interés, valor estimado de ejemplo en soles)
  const op = (t, p = 0, v = 0) => [t, p, v];

  const NEG = {
    restaurante: {
      nombre: "Restaurante La Huerta", grupo: "Comercio y servicios", etiqueta: "Restaurante",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Restaurante La Huerta. ¿En qué te ayudo?",
      temas: [
        { id: "Carta", chip: "Ver la carta", resp: "Tenemos cocina criolla y nikkei, con menú ejecutivo al mediodía y carta completa en la noche.", seguir: [
          { chip: "Opciones vegetarianas", resp: "Sí, tenemos entradas y fondos vegetarianos, y podemos adaptar varios platos." },
          { chip: "Menú ejecutivo", resp: "El menú ejecutivo incluye entrada, fondo y refresco, de lunes a viernes de 12:00 m. a 4:00 p. m." }] },
        { id: "Horarios", chip: "Horarios", resp: "Atendemos de martes a domingo, de 12:00 m. a 11:00 p. m." },
        { id: "Delivery", chip: "¿Hacen delivery?", resp: "Sí, en la zona. Te confirmamos el tiempo al registrar tu pedido." },
        { id: "Eventos", chip: "Eventos y grupos", resp: "Tenemos salón privado para grupos. Para eventos coordinamos menú y presupuesto con una persona del equipo." },
      ],
      flujo: { id: "Reservas", chip: "Reservar una mesa", cierre: "reserva solicitada", pasos: [
        { k: "Personas", q: "¿Para cuántas personas?", o: [op("1 a 2", 1, 120), op("3 a 4", 1, 240), op("5 a 8", 2, 480), op("9 o más (evento)", 3, 900)] },
        { k: "Cuándo", q: "¿Para cuándo la quieres?", o: [op("Hoy", 3), op("Mañana", 2), op("Este fin de semana", 2), op("Otra fecha", 0)] },
        { k: "Ocasión", q: "¿Es por alguna ocasión especial?", o: [op("Cumpleaños", 1), op("Reunión de trabajo", 2), op("Comida familiar", 1), op("Ninguna", 0)] },
      ] },
    },
    dental: {
      nombre: "Clínica Dental Sonrisa", grupo: "Comercio y servicios", etiqueta: "Clínica dental",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Clínica Dental Sonrisa. ¿En qué te ayudo?",
      temas: [
        { id: "Servicios", chip: "Servicios", resp: "Hacemos limpieza, ortodoncia, blanqueamiento, implantes y atención de urgencias.", seguir: [
          { chip: "Ortodoncia", resp: "Evaluamos tu caso en una primera consulta y te explicamos opciones y tiempos." },
          { chip: "Blanqueamiento", resp: "Se hace en consultorio, en una sesión, previa evaluación de tus encías." }] },
        { id: "Horarios", chip: "Horarios", resp: "Atendemos de lunes a sábado, de 9:00 a. m. a 7:00 p. m." },
        { id: "Primera visita", chip: "Primera consulta", resp: "La primera consulta es una evaluación. Se coordina con cita previa." },
        { id: "Urgencias", chip: "Tengo una urgencia", resp: "Si tienes dolor fuerte o un golpe, agenda una cita prioritaria y una persona te llamará de inmediato." },
      ],
      flujo: { id: "Citas", chip: "Agendar una cita", cierre: "cita solicitada", pasos: [
        { k: "Motivo", q: "¿Cuál es el motivo de tu consulta?", o: [op("Limpieza", 1, 150), op("Dolor o urgencia", 3, 250), op("Ortodoncia", 2, 3500), op("Blanqueamiento", 1, 600)] },
        { k: "Cuándo", q: "¿Cuándo quieres venir?", o: [op("Hoy", 3), op("Esta semana", 2), op("Próximo mes", 0)] },
        { k: "Primera vez", q: "¿Es tu primera vez en la clínica?", o: [op("Sí", 1), op("No, ya soy paciente", 1)] },
      ] },
    },
    ropa: {
      nombre: "Moda Lima", grupo: "Comercio y servicios", etiqueta: "Tienda de ropa",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Moda Lima. ¿En qué te ayudo?",
      temas: [
        { id: "Tallas", chip: "Tallas y cambios", resp: "Tenemos tallas S a XL. Puedes cambiar tu prenda en 7 días con tu boleta." },
        { id: "Envíos", chip: "Envíos", resp: "Enviamos a todo Lima y a provincias. Te confirmamos costo y plazo al registrar el pedido." },
        { id: "Pagos", chip: "Medios de pago", resp: "Aceptamos tarjeta, transferencia y billeteras digitales." },
        { id: "Mayoristas", chip: "Compras al por mayor", resp: "Para pedidos grandes tenemos precios por volumen. Una persona del equipo te envía la lista." },
      ],
      flujo: { id: "Pedidos", chip: "Hacer un pedido", cierre: "pedido registrado", pasos: [
        { k: "Categoría", q: "¿Qué prendas te interesan?", o: [op("Polos", 1, 90), op("Jeans", 1, 160), op("Vestidos", 1, 190), op("Lote para mi tienda", 3, 2500)] },
        { k: "Cantidad", q: "¿Cuántas unidades?", o: [op("1 a 2", 1), op("3 a 10", 2), op("11 o más", 3)] },
        { k: "Entrega", q: "¿Cómo quieres recibirlo?", o: [op("Envío en Lima", 2), op("Envío a provincia", 2), op("Recojo en tienda", 1)] },
      ] },
    },
    hotel: {
      nombre: "Hotel Mirador", grupo: "Comercio y servicios", etiqueta: "Hotel",
      saludo: "¡Hola! Soy el asistente virtual (IA) del Hotel Mirador. ¿En qué te ayudo?",
      temas: [
        { id: "Habitaciones", chip: "Habitaciones", resp: "Tenemos habitaciones simples, dobles y suites, con desayuno incluido y Wi-Fi." },
        { id: "Servicios", chip: "Servicios del hotel", resp: "Contamos con recepción 24 horas, sala de reuniones, lavandería y traslado al aeropuerto con costo adicional." },
        { id: "Horarios", chip: "Check-in y check-out", resp: "El check-in es desde las 2:00 p. m. y el check-out hasta las 12:00 m. Consulta por ingreso anticipado." },
        { id: "Ubicación", chip: "Ubicación", resp: "Estamos en una zona céntrica, cerca de restaurantes y transporte. Te enviamos el mapa al confirmar." },
      ],
      flujo: { id: "Cotizaciones", chip: "Cotizar una estadía", cierre: "cotización solicitada", pasos: [
        { k: "Noches", q: "¿Cuántas noches?", o: [op("1", 1, 250), op("2 a 3", 2, 700), op("4 a 7", 2, 1500), op("8 o más", 3, 3200)] },
        { k: "Huéspedes", q: "¿Cuántas personas se hospedan?", o: [op("1", 1), op("2", 1), op("3 a 5", 2), op("Grupo (6+)", 3)] },
        { k: "Motivo", q: "¿Cuál es el motivo del viaje?", o: [op("Turismo", 1), op("Negocios", 2), op("Evento corporativo", 3)] },
      ] },
    },
    inmobiliaria: {
      nombre: "Inmobiliaria Andina", grupo: "Empresas y servicios profesionales", etiqueta: "Inmobiliaria",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Inmobiliaria Andina. ¿En qué te ayudo?",
      temas: [
        { id: "Inmuebles", chip: "Tipos de inmuebles", resp: "Tenemos departamentos, casas, locales comerciales y terrenos, en venta y alquiler." },
        { id: "Financiamiento", chip: "Financiamiento", resp: "Te orientamos con créditos hipotecarios con bancos aliados. La aprobación depende de cada entidad.", seguir: [
          { chip: "¿Qué documentos necesito?", resp: "Normalmente piden DNI, sustento de ingresos y estado de deudas. Tu asesor te da la lista exacta." }] },
        { id: "Visitas", chip: "Agendar una visita", resp: "Coordinamos visitas de lunes a sábado. Dime qué te interesa y te asignamos un asesor." },
        { id: "Propietarios", chip: "Quiero vender o alquilar el mío", resp: "Evaluamos tu inmueble y te explicamos cómo lo promocionamos. Una persona te contacta con la propuesta." },
      ],
      flujo: { id: "Asesoría", chip: "Quiero comprar o invertir", cierre: "asesoría solicitada", pasos: [
        { k: "Operación", q: "¿Qué quieres hacer?", o: [op("Comprar", 2), op("Alquilar", 1), op("Invertir", 3)] },
        { k: "Presupuesto", q: "¿Cuál es tu presupuesto aproximado?", o: [op("Hasta S/ 250 000", 1, 250000), op("S/ 250 000 a 500 000", 2, 500000), op("S/ 500 000 a 1 000 000", 3, 1000000), op("Más de S/ 1 000 000", 3, 1500000)] },
        { k: "Plazo", q: "¿Para cuándo quieres decidir?", o: [op("Este mes", 3), op("En 3 meses", 2), op("Solo estoy mirando", 0)] },
      ] },
    },
    contable: {
      nombre: "Estudio Contable Fénix", grupo: "Empresas y servicios profesionales", etiqueta: "Estudio contable",
      saludo: "¡Hola! Soy el asistente virtual (IA) del Estudio Contable Fénix. ¿En qué te ayudo?",
      temas: [
        { id: "Servicios", chip: "Servicios", resp: "Llevamos contabilidad mensual, planillas, declaraciones tributarias, balances y asesoría para formalizar tu negocio." },
        { id: "Formalización", chip: "Quiero formalizar mi negocio", resp: "Te acompañamos con la elección del régimen y los trámites iniciales. Cada caso se evalúa en una asesoría." },
        { id: "Plazos", chip: "Fechas y obligaciones", resp: "Te enviamos recordatorios de vencimientos. Las fechas oficiales las define la autoridad tributaria; las verificamos para ti cada mes." },
        { id: "Auditoría", chip: "Auditoría y revisión", resp: "Revisamos tus libros y procesos para detectar riesgos antes de una fiscalización." },
      ],
      flujo: { id: "Asesorías", chip: "Solicitar una asesoría", cierre: "asesoría solicitada", pasos: [
        { k: "Tipo de cliente", q: "¿Quién solicita el servicio?", o: [op("Persona natural", 1, 150), op("Pequeña empresa", 2, 500), op("Empresa mediana", 3, 1500), op("Grupo de empresas", 3, 4000)] },
        { k: "Servicio", q: "¿Qué necesitas?", o: [op("Contabilidad mensual", 3), op("Planillas", 2), op("Declaración anual", 1), op("Auditoría", 2)] },
        { k: "Urgencia", q: "¿Cuándo quieres empezar?", o: [op("Esta semana", 3), op("Este mes", 2), op("Solo consulto", 0)] },
      ] },
    },
    logistica: {
      nombre: "TransAndes Logística", grupo: "Empresas y servicios profesionales", etiqueta: "Logística y transporte",
      saludo: "¡Hola! Soy el asistente virtual (IA) de TransAndes Logística. ¿En qué te ayudo?",
      temas: [
        { id: "Servicios", chip: "Servicios de carga", resp: "Ofrecemos carga seca, refrigerada y paquetería, con almacenaje y distribución." },
        { id: "Cobertura", chip: "Cobertura", resp: "Cubrimos Lima y las principales ciudades del país. Para destinos remotos coordinamos tiempos con tu ejecutivo." },
        { id: "Seguimiento", chip: "Seguimiento de mi envío", resp: "Con tu número de guía puedes ver el estado. En esta demo no hay envíos reales, pero así lo recibirías por mensaje." },
        { id: "Seguros", chip: "Seguro de la carga", resp: "Puedes asegurar la mercadería. El costo depende del valor declarado y del tipo de carga." },
      ],
      flujo: { id: "Cotizaciones", chip: "Cotizar un envío", cierre: "cotización solicitada", pasos: [
        { k: "Tipo de carga", q: "¿Qué vas a enviar?", o: [op("Paquetes", 1, 800), op("Carga seca (pallets)", 2, 4500), op("Carga refrigerada", 3, 9000), op("Carga especial", 3, 12000)] },
        { k: "Volumen", q: "¿Qué volumen aproximado?", o: [op("Menos de 100 kg", 0), op("100 a 1000 kg", 2), op("Más de 1 tonelada", 3)] },
        { k: "Frecuencia", q: "¿Con qué frecuencia?", o: [op("Una sola vez", 1), op("Semanal", 3), op("Contrato mensual", 3)] },
      ] },
    },
    software: {
      nombre: "NubeSoft (software para empresas)", grupo: "Empresas y servicios profesionales", etiqueta: "Software B2B",
      saludo: "¡Hola! Soy el asistente virtual (IA) de NubeSoft. ¿En qué te ayudo?",
      temas: [
        { id: "Módulos", chip: "Módulos", resp: "Ofrecemos facturación, inventarios, CRM y recursos humanos, que puedes contratar por separado.", seguir: [
          { chip: "Facturación", resp: "Emite comprobantes electrónicos y los envía por correo. Se integra con tu contabilidad." },
          { chip: "Inventarios", resp: "Controla stock por almacén, alertas de reposición y movimientos." }] },
        { id: "Integraciones", chip: "Integraciones", resp: "Nos conectamos con bancos, pasarelas de pago y hojas de cálculo. Para sistemas propios hay una API." },
        { id: "Soporte", chip: "Soporte y capacitación", resp: "Incluimos soporte por chat y correo, y capacitación inicial para tu equipo." },
        { id: "Seguridad", chip: "Seguridad de los datos", resp: "Los datos se guardan con copias de seguridad y acceso por roles. Para requisitos especiales hablamos con tu área de TI." },
      ],
      flujo: { id: "Demos", chip: "Pedir una demo", cierre: "demo solicitada", pasos: [
        { k: "Equipo", q: "¿Cuántas personas usarían el sistema?", o: [op("1 a 10", 1, 3600), op("11 a 50", 2, 14000), op("51 a 200", 3, 48000), op("Más de 200", 3, 120000)] },
        { k: "Necesidad", q: "¿Qué quieres resolver primero?", o: [op("Facturación", 2), op("Inventarios", 2), op("CRM y ventas", 3), op("Recursos humanos", 2)] },
        { k: "Urgencia", q: "¿Cuándo planean implementarlo?", o: [op("Este mes", 3), op("Este trimestre", 2), op("Aún evaluando", 0)] },
      ] },
    },
    instituto: {
      nombre: "Instituto Horizonte", grupo: "Empresas y servicios profesionales", etiqueta: "Capacitación corporativa",
      saludo: "¡Hola! Soy el asistente virtual (IA) del Instituto Horizonte. ¿En qué te ayudo?",
      temas: [
        { id: "Programas", chip: "Programas", resp: "Tenemos cursos de liderazgo, ventas, seguridad y habilidades digitales, para personas y equipos." },
        { id: "Modalidades", chip: "Modalidades", resp: "Puedes llevarlos presenciales, virtuales o mixtos, en horarios que no afecten tu operación." },
        { id: "Certificación", chip: "Certificados", resp: "Entregamos constancia de participación. Si necesitas una certificación específica, la evaluamos contigo." },
        { id: "Convenios", chip: "Convenios con empresas", resp: "Hacemos convenios para capacitar a todo un equipo con tarifas por grupo y reportes de avance." },
      ],
      flujo: { id: "Capacitaciones", chip: "Capacitar a mi equipo", cierre: "propuesta solicitada", pasos: [
        { k: "Participantes", q: "¿Cuántas personas capacitarías?", o: [op("1 a 10", 1, 3000), op("11 a 50", 2, 12000), op("51 a 200", 3, 40000), op("Más de 200", 3, 90000)] },
        { k: "Tema", q: "¿Qué tema te interesa?", o: [op("Liderazgo", 2), op("Ventas", 2), op("Seguridad y salud", 3), op("Habilidades digitales", 2)] },
        { k: "Modalidad", q: "¿Qué modalidad prefieres?", o: [op("Presencial", 2), op("Virtual", 1), op("Mixta", 2)] },
      ] },
    },
    ferreteria: {
      nombre: "Ferretería Industrial Norte", grupo: "Empresas y servicios profesionales", etiqueta: "Ferretería industrial",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Ferretería Industrial Norte. ¿En qué te ayudo?",
      temas: [
        { id: "Catálogo", chip: "Catálogo", resp: "Vendemos herramientas, tuberías, material eléctrico, seguridad industrial y consumibles para obra y planta." },
        { id: "Crédito", chip: "Crédito para empresas", resp: "Ofrecemos crédito a empresas con evaluación previa. Necesitamos datos de tu empresa y referencias comerciales." },
        { id: "Despachos", chip: "Despachos", resp: "Despachamos a obra o almacén. El plazo depende del stock y de la zona; tu ejecutivo lo confirma." },
        { id: "Garantía", chip: "Garantía y devoluciones", resp: "Los productos tienen garantía del fabricante y cambios según condiciones. Te damos el detalle en tu cotización." },
      ],
      flujo: { id: "Cotizaciones", chip: "Cotizar materiales", cierre: "cotización solicitada", pasos: [
        { k: "Rubro", q: "¿Para qué rubro es?", o: [op("Construcción", 2), op("Minería", 3), op("Manufactura", 2), op("Mantenimiento", 1)] },
        { k: "Compra mensual", q: "¿Cuánto compras al mes, aproximadamente?", o: [op("Hasta S/ 5 000", 1, 5000), op("S/ 5 000 a 20 000", 2, 20000), op("S/ 20 000 a 100 000", 3, 100000), op("Más de S/ 100 000", 3, 200000)] },
        { k: "Frecuencia", q: "¿Con qué frecuencia compras?", o: [op("Una sola vez", 0), op("Mensual", 2), op("Semanal", 3)] },
      ] },
    },
    autos: {
      nombre: "AutoCentro Prime", grupo: "Empresas y servicios profesionales", etiqueta: "Concesionaria y taller",
      saludo: "¡Hola! Soy el asistente virtual (IA) de AutoCentro Prime. ¿En qué te ayudo?",
      temas: [
        { id: "Vehículos", chip: "Vehículos disponibles", resp: "Tenemos autos nuevos y seminuevos, camionetas y vehículos para flotas." },
        { id: "Financiamiento", chip: "Financiamiento", resp: "Trabajamos con entidades financieras. La aprobación y las tasas dependen de cada una." },
        { id: "Mantenimiento", chip: "Mantenimiento y taller", resp: "Hacemos mantenimiento preventivo y correctivo, con cita previa y recordatorio por mensaje." },
        { id: "Flotas", chip: "Flotas para empresas", resp: "Para empresas ofrecemos propuestas por volumen y plan de mantenimiento para toda la flota." },
      ],
      flujo: { id: "Citas", chip: "Agendar prueba o servicio", cierre: "cita solicitada", pasos: [
        { k: "Interés", q: "¿Qué te interesa?", o: [op("Auto nuevo", 3, 85000), op("Seminuevo", 2, 45000), op("Servicio de taller", 1, 400), op("Flota empresarial", 3, 400000)] },
        { k: "Presupuesto", q: "¿Cómo piensas pagar?", o: [op("Al contado", 3), op("Con financiamiento", 2), op("Aún no lo defino", 0)] },
        { k: "Plazo", q: "¿Cuándo quieres decidir?", o: [op("Esta semana", 3), op("Este mes", 2), op("Más adelante", 0)] },
      ] },
    },
    seguros: {
      nombre: "Seguros Aval (corredora de seguros)", grupo: "Empresas y servicios profesionales", etiqueta: "Corredora de seguros",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Seguros Aval. ¿En qué te ayudo?",
      temas: [
        { id: "Tipos de seguro", chip: "Tipos de seguro", resp: "Trabajamos seguros de salud, vehiculares, de vida y para empresas, comparando opciones de varias aseguradoras." },
        { id: "Coberturas", chip: "Qué cubre un seguro", resp: "Depende de la póliza. Te explicamos coberturas, exclusiones y deducibles antes de que contrates." },
        { id: "Siniestros", chip: "Tuve un siniestro", resp: "Lamentamos lo ocurrido. Te pasamos con una persona para guiarte con el reporte y los documentos." },
        { id: "Empresas", chip: "Seguros para mi empresa", resp: "Evaluamos riesgos de tu operación y te proponemos coberturas para bienes, personal y responsabilidad." },
      ],
      flujo: { id: "Cotizaciones", chip: "Cotizar un seguro", cierre: "cotización solicitada", pasos: [
        { k: "Seguro", q: "¿Qué seguro buscas?", o: [op("Salud", 2, 3000), op("Vehicular", 2, 2500), op("Vida", 2, 1800), op("Para mi empresa", 3, 25000)] },
        { k: "Asegurados", q: "¿Cuántas personas o vehículos?", o: [op("1", 1), op("2 a 5", 2), op("6 a 20", 3), op("Más de 20", 3)] },
        { k: "Inicio", q: "¿Cuándo necesitas la cobertura?", o: [op("Lo antes posible", 3), op("Este mes", 2), op("Estoy comparando", 0)] },
      ] },
    },
  };

  let clave = "restaurante", modo = "menu", pasoIdx = 0, datos = {}, puntos = 0, valor = 0, nombre = "";
  let stats, leads;
  const reiniciar = () => { stats = { chats: 1, temas: {}, derivadas: 0 }; leads = []; modo = "menu"; pasoIdx = 0; datos = {}; puntos = 0; valor = 0; nombre = ""; };
  const sol = (n) => "S/ " + Math.round(n).toLocaleString("en-US");

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const espera = (ms) => new Promise((r) => setTimeout(r, reducido ? 0 : ms));

  function burbuja(rol, texto) {
    if (rol === "user" || !texto.endsWith("…")) hist.push({ rol: rol === "user" ? "usuario" : "bot", texto });
    const b = el("div", "demo-msg " + rol, texto);
    log.append(b);
    log.scrollTop = log.scrollHeight;
  }
  async function bot(texto) {
    chips.replaceChildren(); form.hidden = true; libre.hidden = true;
    const t = el("div", "demo-msg bot demo-typing", "escribiendo…");
    log.append(t); log.scrollTop = log.scrollHeight;
    await espera(650);
    t.remove();
    burbuja("bot", texto);
  }
  function chip(texto, fn, cls) {
    const b = el("button", "demo-chip" + (cls ? " " + cls : ""), texto);
    b.type = "button";
    b.addEventListener("click", () => { burbuja("user", texto); fn(); });
    chips.append(b);
  }

  async function menu(msg, seguir) {
    modo = "menu";
    if (msg) await bot(msg);
    chips.replaceChildren(); form.hidden = true;
    const n = NEG[clave];
    if (seguir) for (const s of seguir) chip(s.chip, async () => { stats.temas[s.chip] = (stats.temas[s.chip] || 0) + 1; await menu(s.resp); }, "demo-chip-sub");
    for (const t of n.temas) chip(t.chip, async () => { stats.temas[t.id] = (stats.temas[t.id] || 0) + 1; await menu(t.resp, t.seguir); });
    chip(n.flujo.chip, () => iniciarFlujo(), "demo-chip-main");
    chip("Hablar con una persona", async () => { stats.derivadas++; const l = leads[leads.length - 1]; if (l) l.humano = true; await menu("Claro. Aviso a una persona del equipo para que te contacte. Mientras, puedo seguir ayudándote por aquí."); });
    libre.hidden = !ia;
    pintar();
  }

  // Flujo de calificación: preguntas con opciones, luego nombre y celular
  async function iniciarFlujo() {
    stats.temas[NEG[clave].flujo.id] = (stats.temas[NEG[clave].flujo.id] || 0) + 1;
    modo = "flujo"; pasoIdx = 0; datos = {}; puntos = 0; valor = 0;
    await preguntar();
  }
  async function preguntar() {
    const f = NEG[clave].flujo;
    const p = f.pasos[pasoIdx];
    await bot(p.q);
    chips.replaceChildren();
    for (const [t, pt, v] of p.o) chip(t, async () => { datos[p.k] = t; puntos += pt; valor += v; pasoIdx++; if (pasoIdx < f.pasos.length) await preguntar(); else { modo = "nombre"; await bot("Perfecto, con eso ya puedo registrar tu solicitud. ¿Cuál es tu nombre?"); pedir("Tu nombre", "Ej.: Ana"); } });
  }
  function pedir(rotulo, ejemplo) {
    chips.replaceChildren(); libre.hidden = true;
    etiqueta.textContent = rotulo; entrada.placeholder = ejemplo; entrada.value = ""; form.hidden = false;
    entrada.focus({ preventScroll: true });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = entrada.value.trim().slice(0, 60);
    if (!v) return;
    burbuja("user", v); entrada.value = "";
    if (modo === "nombre") { nombre = v; modo = "tel"; await bot(`Gracias, ${nombre}. ¿A qué celular te contactamos?`); pedir("Tu celular (de ejemplo)", "Ej.: 999 888 777"); return; }
    if (modo === "tel") {
      if (v.replace(/\D/g, "").length < 7) { await bot("Ese número parece corto. ¿Me lo escribes de nuevo?"); pedir("Tu celular (de ejemplo)", "Ej.: 999 888 777"); return; }
      const f = NEG[clave].flujo;
      const prio = puntos >= 6 ? "Alta" : puntos >= 3 ? "Media" : "Baja";
      leads.push({ nombre, tel: v, tema: f.id, datos: { ...datos }, prio, valor, estado: 0, humano: false });
      const resumen = Object.entries(datos).map(([k, x]) => `${k}: ${x}`).join(" · ");
      await bot(`Listo, ${nombre}. Registré tu solicitud (${f.cierre}).\n${resumen}\nUna persona del equipo te contactará. Mira el paso 2 para ver cómo quedó tu registro.`);
      await menu();
      document.querySelector('[data-tab="crm"]').classList.add("nuevo");
    }
  });

  libre.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = libreIn.value.trim().slice(0, 300);
    if (!v || modo !== "menu") return;
    libreIn.value = "";
    burbuja("user", v);
    stats.temas["Pregunta libre"] = (stats.temas["Pregunta libre"] || 0) + 1;
    chips.replaceChildren(); libre.hidden = true;
    const t = el("div", "demo-msg bot demo-typing", "escribiendo…");
    log.append(t); log.scrollTop = log.scrollHeight;
    let texto = "Ahora no puedo responder. Prueba con los botones o agenda tu diagnóstico gratis.";
    try {
      const r = await fetch("/api/demo-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ negocio: clave, mensajes: hist.slice(-8) }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.texto) texto = j.texto;
      else if (r.status === 429) texto = "Llegaste al límite de la demostración por hoy. Agenda tu diagnóstico gratis para verlo con tu negocio.";
    } catch {}
    t.remove();
    burbuja("bot", texto);
    await menu();
  });

  const COLS = ["Nueva", "Contactada", "Cerrada"];
  const ORDEN = { Alta: 0, Media: 1, Baja: 2 };
  function pintar() {
    // paso 2: tablero
    const cols = $("demo-cols"); cols.replaceChildren();
    $("demo-crm-vacio").hidden = leads.length > 0;
    COLS.forEach((c, i) => {
      const col = el("div", "demo-col"); col.append(el("h3", null, `${c} (${leads.filter((l) => l.estado === i).length})`));
      leads.filter((l) => l.estado === i).sort((a, b) => ORDEN[a.prio] - ORDEN[b.prio]).forEach((l) => {
        const t = el("div", "demo-card");
        t.append(el("b", null, l.nombre), el("span", "mute", `${l.tema} · ${l.tel}`));
        t.append(el("span", "demo-datos", Object.entries(l.datos).map(([k, x]) => `${k}: ${x}`).join(" · ")));
        const fila = el("span", "demo-tags");
        fila.append(el("span", "demo-prio p" + l.prio, "Prioridad " + l.prio.toLowerCase()));
        if (l.valor) fila.append(el("span", "demo-tag demo-valor", "≈ " + sol(l.valor) + " (ejemplo)"));
        if (l.humano) fila.append(el("span", "demo-tag", "Pidió una persona"));
        t.append(fila);
        if (i < 2) { const b = el("button", "btn ghost", i === 0 ? "Marcar contactada" : "Marcar cerrada"); b.type = "button"; b.addEventListener("click", () => { l.estado++; pintar(); }); t.append(b); }
        col.append(t);
      });
      cols.append(col);
    });
    // paso 3: reporte
    const k = $("demo-kpis"); k.replaceChildren();
    const total = leads.reduce((a, l) => a + l.valor, 0);
    const cerrado = leads.filter((l) => l.estado === 2).reduce((a, l) => a + l.valor, 0);
    const datosK = [["Conversaciones", String(stats.chats)], ["Clientes registrados", String(leads.length)], ["Prioridad alta", String(leads.filter((l) => l.prio === "Alta").length)], ["Pasaron a una persona", String(stats.derivadas)], ["Valor en seguimiento (ejemplo)", sol(total)], ["Valor cerrado (ejemplo)", sol(cerrado)]];
    for (const [t, n] of datosK) { const d = el("div", "demo-kpi"); d.append(el("b", null, n), el("span", "mute", t)); k.append(d); }
    const b = $("demo-barras"); b.replaceChildren();
    const temas = Object.entries(stats.temas).sort((x, y) => y[1] - x[1]).slice(0, 8);
    b.append(el("h3", null, "Lo que más preguntan"));
    if (!temas.length) b.append(el("p", "mute", "Aún sin datos: haz consultas en el paso 1."));
    const max = Math.max(1, ...temas.map((x) => x[1]));
    for (const [t, n] of temas) { const f = el("div", "demo-barra"); const barra = el("i"); barra.style.width = Math.round((n / max) * 100) + "%"; f.append(el("span", null, `${t} (${n})`), barra); b.append(f); }
  }

  // Selector de negocio: agrupado y generado desde los datos
  const sel = $("demo-neg");
  const grupos = [...new Set(Object.values(NEG).map((n) => n.grupo))];
  for (const g of grupos) {
    const bloque = el("div", "demo-grupo");
    bloque.append(el("span", "demo-grupo-t", g));
    const fila = el("div", "demo-grupo-f");
    for (const [k, n] of Object.entries(NEG)) if (n.grupo === g) { const b = el("button", null, n.etiqueta); b.type = "button"; b.dataset.neg = k; b.setAttribute("aria-pressed", "false"); b.addEventListener("click", () => negocio(k)); fila.append(b); }
    bloque.append(fila); sel.append(bloque);
  }

  function negocio(k) {
    clave = k; reiniciar();
    document.querySelectorAll("[data-neg]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.neg === k)));
    log.replaceChildren(); chips.replaceChildren(); hist.length = 0;
    burbuja("bot", NEG[k].saludo);
    menu(); pintar();
  }
  function pestaña(t) {
    document.querySelectorAll("[data-tab]").forEach((b) => { const on = b.dataset.tab === t; b.setAttribute("aria-selected", String(on)); if (on) b.classList.remove("nuevo"); });
    $("demo-chat").hidden = t !== "chat"; $("demo-crm").hidden = t !== "crm"; $("demo-rep").hidden = t !== "rep";
    pintar();
  }
  document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => pestaña(b.dataset.tab)));
  negocio("restaurante");
  // ¿La demo con IA real está encendida? Si no, solo se usan los botones.
  fetch("/api/demo-chat").then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.activo) { ia = true; if (modo === "menu") libre.hidden = false; } }).catch(() => {});
})();
