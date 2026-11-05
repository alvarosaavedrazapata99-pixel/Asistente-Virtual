/* Demostración simulada: todo ocurre en esta página; no se envía ni se guarda nada. */
(() => {
  const app = document.getElementById("demo-app");
  if (!app) return;
  const $ = (id) => document.getElementById(id);
  const log = $("demo-log"), chips = $("demo-chips"), form = $("demo-form"), entrada = $("demo-in"), etiqueta = $("demo-lbl");
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const NEG = {
    polleria: {
      nombre: "Pollería Don Beto",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Pollería Don Beto. ¿En qué te ayudo?",
      temas: [
        { id: "Carta", chip: "Ver la carta", resp: "Tenemos pollo a la brasa (1/4, 1/2 y entero), parrillas y guarniciones. Si quieres, te anoto para un pedido." },
        { id: "Horarios", chip: "Horarios", resp: "Atendemos todos los días de 12:00 m. a 11:00 p. m." },
        { id: "Delivery", chip: "¿Hacen delivery?", resp: "Sí, hacemos delivery en la zona. Te confirmamos el tiempo al registrar tu pedido." },
      ],
      accion: { chip: "Hacer un pedido", id: "Pedidos" },
    },
    dental: {
      nombre: "Clínica Dental Sonrisa",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Clínica Dental Sonrisa. ¿En qué te ayudo?",
      temas: [
        { id: "Servicios", chip: "Servicios", resp: "Hacemos limpieza, ortodoncia, blanqueamiento y atención de urgencias." },
        { id: "Horarios", chip: "Horarios", resp: "Atendemos de lunes a sábado, de 9:00 a. m. a 7:00 p. m." },
        { id: "Primera visita", chip: "Primera consulta", resp: "La primera consulta es una evaluación. Te la coordinamos con cita previa." },
      ],
      accion: { chip: "Agendar una cita", id: "Citas" },
    },
    ropa: {
      nombre: "Moda Lima (tienda de ropa)",
      saludo: "¡Hola! Soy el asistente virtual (IA) de Moda Lima. ¿En qué te ayudo?",
      temas: [
        { id: "Tallas", chip: "Tallas y cambios", resp: "Tenemos tallas S a XL. Puedes cambiar tu prenda en 7 días con tu boleta." },
        { id: "Envíos", chip: "Envíos", resp: "Enviamos a todo Lima y a provincias. Te confirmamos costo y plazo al registrar tu pedido." },
        { id: "Pagos", chip: "Medios de pago", resp: "Aceptamos tarjeta, transferencia y billeteras digitales." },
      ],
      accion: { chip: "Hacer un pedido", id: "Pedidos" },
    },
  };

  let clave = "polleria", paso = "menu", nombre = "";
  let stats, leads;
  const reiniciar = () => { stats = { chats: 1, temas: {}, derivadas: 0 }; leads = []; paso = "menu"; nombre = ""; };

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const espera = (ms) => new Promise((r) => setTimeout(r, reducido ? 0 : ms));

  function burbuja(rol, texto) {
    const b = el("div", "demo-msg " + rol, texto);
    log.append(b);
    log.scrollTop = log.scrollHeight;
  }
  async function bot(texto) {
    chips.replaceChildren(); form.hidden = true;
    const t = el("div", "demo-msg bot demo-typing", "escribiendo…");
    log.append(t); log.scrollTop = log.scrollHeight;
    await espera(650);
    t.remove();
    burbuja("bot", texto);
  }

  function chip(texto, fn) {
    const b = el("button", "demo-chip", texto);
    b.type = "button";
    b.addEventListener("click", () => { burbuja("user", texto); fn(); });
    chips.append(b);
  }

  async function menu(msg) {
    paso = "menu";
    if (msg) await bot(msg);
    chips.replaceChildren(); form.hidden = true;
    const n = NEG[clave];
    for (const t of n.temas) chip(t.chip, async () => { stats.temas[t.id] = (stats.temas[t.id] || 0) + 1; await menu(t.resp); });
    chip(n.accion.chip, async () => { stats.temas[n.accion.id] = (stats.temas[n.accion.id] || 0) + 1; paso = "nombre"; await bot("¡Perfecto! ¿Cuál es tu nombre?"); pedir("Tu nombre", "Ej.: Ana"); });
    chip("Hablar con una persona", async () => { stats.derivadas++; const l = leads[leads.length - 1]; if (l) l.humano = true; await menu("Claro. Aviso a una persona del equipo para que te contacte. Mientras, puedo seguir ayudándote por aquí."); });
    pintar();
  }
  function pedir(rotulo, ejemplo) {
    chips.replaceChildren();
    etiqueta.textContent = rotulo; entrada.placeholder = ejemplo; entrada.value = ""; form.hidden = false;
    entrada.focus({ preventScroll: true });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = entrada.value.trim().slice(0, 60);
    if (!v) return;
    burbuja("user", v); entrada.value = "";
    if (paso === "nombre") { nombre = v; paso = "tel"; await bot(`Gracias, ${nombre}. ¿A qué celular te contactamos?`); pedir("Tu celular (de ejemplo)", "Ej.: 999 888 777"); return; }
    if (paso === "tel") {
      if (v.replace(/\D/g, "").length < 7) { await bot("Ese número parece corto. ¿Me lo escribes de nuevo?"); pedir("Tu celular (de ejemplo)", "Ej.: 999 888 777"); return; }
      leads.push({ nombre, tel: v, tema: NEG[clave].accion.id, estado: 0, humano: false });
      await menu(`Listo, ${nombre}. Quedaste registrado y una persona te contactará. Ve al paso 2 para ver cómo quedó tu registro.`);
      const t = document.querySelector('[data-tab="crm"]'); t.classList.add("nuevo");
    }
  });

  const COLS = ["Nueva", "Contactada", "Cerrada"];
  function pintar() {
    // paso 2: tablero
    const cols = $("demo-cols"); cols.replaceChildren();
    $("demo-crm-vacio").hidden = leads.length > 0;
    COLS.forEach((c, i) => {
      const col = el("div", "demo-col"); col.append(el("h3", null, c));
      leads.filter((l) => l.estado === i).forEach((l) => {
        const t = el("div", "demo-card");
        t.append(el("b", null, l.nombre), el("span", "mute", `${l.tema} · ${l.tel}`));
        if (l.humano) t.append(el("span", "demo-tag", "Pidió hablar con una persona"));
        if (i < 2) { const b = el("button", "btn ghost", i === 0 ? "Marcar contactada" : "Marcar cerrada"); b.type = "button"; b.addEventListener("click", () => { l.estado++; pintar(); }); t.append(b); }
        col.append(t);
      });
      cols.append(col);
    });
    // paso 3: reporte
    const k = $("demo-kpis"); k.replaceChildren();
    const datos = [["Conversaciones", stats.chats], ["Clientes registrados", leads.length], ["Cerrados", leads.filter((l) => l.estado === 2).length], ["Pasaron a una persona", stats.derivadas]];
    for (const [t, n] of datos) { const d = el("div", "demo-kpi"); d.append(el("b", null, String(n)), el("span", "mute", t)); k.append(d); }
    const b = $("demo-barras"); b.replaceChildren();
    const temas = Object.entries(stats.temas).sort((x, y) => y[1] - x[1]);
    b.append(el("h3", null, "Lo que más preguntan"));
    if (!temas.length) b.append(el("p", "mute", "Aún sin datos: haz consultas en el paso 1."));
    const max = Math.max(1, ...temas.map((x) => x[1]));
    for (const [t, n] of temas) { const f = el("div", "demo-barra"); const barra = el("i"); barra.style.width = Math.round((n / max) * 100) + "%"; f.append(el("span", null, `${t} (${n})`), barra); b.append(f); }
  }

  function negocio(k) {
    clave = k; reiniciar();
    document.querySelectorAll("[data-neg]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.neg === k)));
    log.replaceChildren(); chips.replaceChildren();
    burbuja("bot", NEG[k].saludo);
    menu(); pintar();
  }
  function pestaña(t) {
    document.querySelectorAll("[data-tab]").forEach((b) => { const on = b.dataset.tab === t; b.setAttribute("aria-selected", String(on)); if (on) b.classList.remove("nuevo"); });
    $("demo-chat").hidden = t !== "chat"; $("demo-crm").hidden = t !== "crm"; $("demo-rep").hidden = t !== "rep";
    pintar();
  }
  document.querySelectorAll("[data-neg]").forEach((b) => b.addEventListener("click", () => negocio(b.dataset.neg)));
  document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => pestaña(b.dataset.tab)));
  negocio("polleria");
})();
