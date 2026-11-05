/* Asistente del diagnóstico: elige rubro, responde ~11 preguntas, deja sus datos y ve el resultado al instante.
   El resultado se calcula aquí para mostrarlo sin esperas; el servidor lo recalcula, lo guarda y envía los correos. */
(() => {
  const D = window.DIAG, raiz = document.getElementById("dg");
  if (!D || !raiz) return;
  const vista = document.getElementById("dg-vista"), prog = document.getElementById("dg-prog"), barra = document.getElementById("dg-barra"), pasoEl = document.getElementById("dg-paso");
  const form = document.getElementById("dg-datos"), err = document.getElementById("dg-err"), enviar = document.getElementById("dg-enviar");
  const planes = JSON.parse(raiz.dataset.planes || "{}"), wa = raiz.dataset.wa || "", aclaracion = raiz.dataset.aclaracion || "";
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const sol = (n) => "S/ " + Number(n).toLocaleString("en-US");
  const idem = (crypto.randomUUID ? crypto.randomUUID() : "k" + Date.now() + Math.random().toString(16).slice(2));

  let rubro = null, i = -1; // i: -1 = elegir rubro; 0.. = pregunta; PREGUNTAS.length = datos
  const resp = {};
  const total = D.PREGUNTAS.length;

  function enfocar() { const h = vista.querySelector("h1,h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  function progreso() {
    prog.hidden = i < 0 && !form.hidden === false;
    const n = Math.max(0, Math.min(i, total));
    barra.style.width = Math.round((n / (total + 1)) * 100) + "%";
    pasoEl.textContent = i < 0 ? "" : i >= total ? "Último paso" : `Pregunta ${i + 1} de ${total}`;
  }

  function elegirRubro() {
    i = -1; form.hidden = true; prog.hidden = true; vista.hidden = false;
    vista.replaceChildren();
    vista.append(el("h1", null, "¿Qué tipo de negocio tienes?"), el("p", "lead", "Con eso adaptamos las preguntas a tu rubro."));
    const grupos = [...new Set(D.RUBROS.map((r) => r.grupo))];
    for (const g of grupos) {
      vista.append(el("h3", "dg-grupo", g));
      const f = el("div", "dg-opts");
      for (const r of D.RUBROS.filter((x) => x.grupo === g)) { const b = el("button", "dg-opt", r.etiqueta); b.type = "button"; b.addEventListener("click", () => { rubro = r; preguntar(0); }); f.append(b); }
      vista.append(f);
    }
    enfocar();
  }

  function preguntar(n) {
    i = n; form.hidden = true; vista.hidden = false; prog.hidden = false;
    if (n >= total) return datos();
    const p = D.PREGUNTAS[n], opts = D.opcionesDe(p, rubro);
    vista.replaceChildren(el("h2", null, p.texto));
    const caja = el("div", "dg-opts");
    const sel = new Set(resp[p.id] ? [].concat(resp[p.id]) : []);
    const seguir = el("button", "btn amb", "Continuar"); seguir.type = "button";
    const pintar = () => { seguir.disabled = sel.size === 0; seguir.textContent = p.tipo === "varias" ? `Continuar (${sel.size})` : "Continuar"; };
    for (const o of opts) {
      const b = el("button", "dg-opt", o.texto); b.type = "button"; b.setAttribute("aria-pressed", String(sel.has(o.id)));
      b.addEventListener("click", () => {
        if (p.tipo === "una") { resp[p.id] = o.id; preguntar(n + 1); return; }
        if (sel.has(o.id)) sel.delete(o.id); else if (sel.size < p.max) sel.add(o.id);
        caja.querySelectorAll(".dg-opt").forEach((x, k) => x.setAttribute("aria-pressed", String(sel.has(opts[k].id))));
        pintar();
      });
      caja.append(b);
    }
    vista.append(caja);
    if (p.tipo === "varias") { seguir.addEventListener("click", () => { resp[p.id] = [...sel]; preguntar(n + 1); }); pintar(); vista.append(el("p", "mute", p.max > 1 ? `Puedes elegir hasta ${p.max}.` : ""), seguir); }
    const atras = el("button", "btn ghost", "Atrás"); atras.type = "button"; atras.addEventListener("click", () => (n === 0 ? elegirRubro() : preguntar(n - 1)));
    vista.append(atras);
    progreso(); enfocar();
  }

  function datos() {
    vista.hidden = true; form.hidden = false; prog.hidden = false; i = total; progreso();
    form.querySelector("h2").tabIndex = -1; form.querySelector("h2").focus({ preventScroll: true }); scrollTo({ top: 0 });
  }
  document.getElementById("dg-atras-datos").addEventListener("click", () => preguntar(total - 1));

  const esCorreo = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const esCel = (v) => { const t = v.trim(); let d = t.replace(/\D/g, ""); if (t.startsWith("+") && !d.startsWith("51")) return d.length >= 8 && d.length <= 15; if (d.length === 11 && d.startsWith("51")) d = d.slice(2); return /^9\d{8}$/.test(d); };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const nombre = String(f.get("nombre") || "").trim(), negocio = String(f.get("negocio") || "").trim(), cel = String(f.get("celular") || "").trim(), mail = String(f.get("email") || "").trim();
    err.textContent = "";
    if (nombre.length < 2) { err.textContent = "Escribe tu nombre."; return; }
    if (!cel && !mail) { err.textContent = "Escribe un celular o un correo."; return; }
    if (cel && !esCel(cel)) { err.textContent = "El celular no parece válido (si es de otro país, empieza con +)."; return; }
    if (mail && !esCorreo(mail)) { err.textContent = "El correo no parece válido."; return; }
    if (!f.get("ok")) { err.textContent = "Necesitamos tu autorización para enviarte el diagnóstico."; return; }
    enviar.disabled = true;
    const local = D.evaluar(rubro.id, resp);
    resultado(local, { nombre, mail }, "enviando");
    const q = new URLSearchParams(location.search);
    try {
      const r = await fetch("/api/diagnostico", { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({
        rubro: rubro.id, respuestas: resp, nombre, negocio, celular: cel, email: mail, consentimiento: true, idempotency_key: idem,
        utm_source: q.get("utm_source") || "", utm_medium: q.get("utm_medium") || "", utm_campaign: q.get("utm_campaign") || "",
        dispositivo: matchMedia("(pointer: coarse)").matches ? "movil" : "escritorio", web_url_trampa: String(f.get("web_url_trampa") || ""),
        turnstile: (form.querySelector('[name="cf-turnstile-response"]') || {}).value || "" }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) estadoEnvio(j.correo_enviado && mail ? "copia" : mail ? "sin-copia" : "guardado", mail);
      else estadoEnvio("fallo", mail);
    } catch { estadoEnvio("fallo", mail); }
  });

  const MENSAJES = {
    enviando: "Guardando tu diagnóstico…",
    copia: (m) => `Te enviamos una copia a ${m}. Revisa también la carpeta de spam.`,
    "sin-copia": () => "Guardamos tu diagnóstico. No pudimos enviar la copia por correo ahora; puedes guardarlo en PDF aquí abajo.",
    guardado: () => "Guardamos tu diagnóstico y una persona de THREE3 podrá contactarte.",
    fallo: () => "No pudimos guardar tus datos ahora. Tu diagnóstico es este; guárdalo en PDF y vuelve a intentar más tarde.",
  };
  function estadoEnvio(k, m) { const e = document.getElementById("dg-estado"); if (e) { const t = MENSAJES[k]; e.textContent = typeof t === "function" ? t(m) : t; } }

  function resultado(r, c, _estado) {
    form.hidden = true; prog.hidden = true; vista.hidden = false; vista.replaceChildren(); vista.className = "dg-res";
    const nivel = r.madurez < 35 ? "Bajo" : r.madurez < 70 ? "Medio" : "Alto";
    vista.append(el("h1", null, `${c.nombre.split(" ")[0]}, este es tu diagnóstico`));
    vista.append(el("p", "mute", `${r.rubroNombre} · estimación orientativa calculada con tus respuestas`));
    const medidor = el("div", "dg-medidor"); medidor.style.setProperty("--p", r.madurez + "%");
    const num = el("div", "dg-num"); num.append(el("b", null, String(r.madurez)), el("small", null, "de 100"));
    medidor.append(num); vista.append(medidor);
    vista.append(el("p", "dg-nivel", `Nivel de automatización de tu atención: ${nivel}`));
    const perd = el("div", "dg-card");
    perd.append(el("h3", null, "Lo que podrías estar dejando pasar"));
    perd.append(el("p", null, `Con ~${r.consultas} consultas al mes y la forma en que atiendes hoy, cerca de ${r.perdidaPct} de cada 100 podrían quedar sin atender a tiempo: unas ${r.perdidas} al mes. Es una estimación, no una garantía.`));
    vista.append(perd);
    const g = el("div", "dg-card"); g.append(el("h3", null, "3 mejoras rápidas para ti"));
    const ol = el("ol"); for (const x of r.ganancias) ol.append(el("li", null, x)); g.append(ol); vista.append(g);
    const p = planes[r.plan] || { n: r.plan, r: "", i: 0, m: 0 };
    const pl = el("div", "dg-card dg-plan"); pl.append(el("h3", null, "Plan sugerido para empezar"), el("p", "dg-plan-n", p.n + (r.modulo ? " + módulo de leads y CRM" : "")), el("p", "mute", p.r));
    const det = el("details", "inversion"); det.append(el("summary", null, "Ver inversión"));
    const pr = el("div", "precio"); const mod = planes["modulo-leads-crm"];
    pr.append(el("small", null, "Desde"), el("b", null, sol(p.i) + " pago inicial"), el("span", "mes", "+ " + sol(p.m) + " al mes"));
    if (r.modulo && mod) pr.append(el("span", "mes", `Módulo de leads y CRM: desde ${sol(mod.i)} + ${sol(mod.m)} al mes`));
    pr.append(el("p", "nota-precio", aclaracion + " El precio final se confirma por escrito.")); det.append(pr); pl.append(det); vista.append(pl);
    const est = el("p", "mute", MENSAJES.enviando); est.id = "dg-estado"; est.setAttribute("role", "status"); vista.append(est);
    const cta = el("div", "cta");
    if (wa) { const a = el("a", "btn amb", "Conversar con un asesor"); a.href = wa; a.target = "_blank"; a.rel = "noopener noreferrer"; cta.append(a); }
    const pdf = el("button", "btn ghost", "Guardar PDF"); pdf.type = "button"; pdf.addEventListener("click", () => print());
    const demo = el("a", "btn ghost", "Ver cómo atendería mi bot"); demo.href = "/#demo";
    cta.append(pdf, demo); vista.append(cta);
    enfocar();
  }

  const pre = new URLSearchParams(location.search).get("r");
  const inicial = pre && D.rubro(pre);
  if (inicial) { rubro = inicial; preguntar(0); } else elegirRubro();
})();
