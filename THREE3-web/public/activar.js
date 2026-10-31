/* Flujo "Activar": abre el formulario, valida y envía la solicitud.
   Con endpoint configurado (data-endpoint) la envía sola; sin endpoint, o si falla, deja la solicitud lista para copiar. */
(() => {
  const d = document.getElementById("activar");
  if (!d || typeof d.showModal !== "function") return;
  const form = d.querySelector("form");
  const ok = d.querySelector("[data-ok]");
  const resumen = d.querySelector("[data-resumen]");
  const copiar = d.querySelector("[data-copiar]");
  const estado = d.querySelector("[data-estado]");
  const titulo = ok.querySelector("h2");
  const envio = form.querySelector('button[type="submit"]');
  const endpoint = () => d.getAttribute("data-endpoint") || "";
  let ultimo = null;
  let mensaje = "";
  let idem = "";
  let enviando = false;

  const campo = (n) => form.elements[n];
  const error = (n, t) => {
    const el = form.querySelector(`[data-err="${n}"]`);
    if (el) el.textContent = t;
    const c = campo(n);
    if (c) c.setAttribute("aria-invalid", t ? "true" : "false");
  };
  const nuevaClave = () => (crypto.randomUUID ? crypto.randomUUID() : `k${Date.now()}${Math.random().toString(16).slice(2)}`);

  function abrir(servicio, disparador) {
    ultimo = disparador;
    form.reset();
    ["nombre", "contacto", "acepto"].forEach((n) => error(n, ""));
    ok.hidden = true;
    form.hidden = false;
    envio.disabled = false;
    envio.textContent = "Preparar mi solicitud";
    enviando = false;
    idem = nuevaClave(); // misma clave si hace doble clic: el servidor ignora el reenvío
    if (servicio) campo("servicio").value = servicio;
    d.showModal();
    // En celular no se enfoca el campo: así no salta el teclado antes de leer el formulario.
    if (matchMedia("(pointer: fine)").matches) campo("nombre").focus();
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-activar]");
    if (t) {
      e.preventDefault();
      abrir(t.getAttribute("data-activar"), t);
      return;
    }
    if (e.target.closest("[data-cerrar]") || e.target === d) d.close();
  });
  d.addEventListener("close", () => ultimo && ultimo.focus && ultimo.focus());

  const esCorreo = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const esCelular = (v) => /^\+?[\d\s-]{9,15}$/.test(v) && v.replace(/\D/g, "").length >= 9;

  function mostrar(modo, textoEstado) {
    form.hidden = true;
    ok.hidden = false;
    ok.classList.toggle("enviado", modo === "enviado");
    titulo.textContent = modo === "enviado" ? "Recibimos tu solicitud" : "Tu solicitud está lista";
    estado.textContent = textoEstado || "";
    resumen.textContent = mensaje;
    titulo.focus();
  }

  async function enviar(payload) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20000);
    try {
      // text/plain evita la comprobación previa de CORS del navegador
      const r = await fetch(endpoint(), { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "text/plain;charset=utf-8" }, signal: ctl.signal });
      const j = await r.json();
      return j && j.ok === true;
    } catch {
      return false;
    } finally {
      clearTimeout(t);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviando) return;
    const nombre = campo("nombre").value.trim();
    const contacto = campo("contacto").value.trim();
    let bien = true;
    error("nombre", "");
    error("contacto", "");
    error("acepto", "");
    if (nombre.length < 2) { error("nombre", "Escribe tu nombre."); bien = false; }
    if (!esCorreo(contacto) && !esCelular(contacto)) { error("contacto", "Escribe un correo válido o un celular de 9 dígitos."); bien = false; }
    if (!campo("acepto").checked) { error("acepto", "Necesitamos tu autorización para responderte."); bien = false; }
    if (!bien) { form.querySelector('[aria-invalid="true"]').focus(); return; }

    const s = campo("servicio");
    const negocio = campo("negocio").value.trim();
    const detalle = campo("detalle").value.trim();
    mensaje = [
      `Hola THREE3, quiero cotizar: ${s.options[s.selectedIndex].text}.`,
      `Nombre: ${nombre}`,
      negocio ? `Negocio: ${negocio}` : "",
      `Contacto: ${contacto}`,
      detalle ? `Detalle: ${detalle}` : "",
    ].filter(Boolean).join("\n");

    if (!endpoint()) return mostrar("manual");

    enviando = true;
    envio.disabled = true;
    envio.textContent = "Enviando…";
    const q = new URLSearchParams(location.search);
    const bueno = await enviar({
      nombre, negocio, detalle,
      email: esCorreo(contacto) ? contacto : "",
      celular: esCorreo(contacto) ? "" : contacto,
      servicio_id: s.value,
      consentimiento: true,
      idempotency_key: idem,
      utm_source: q.get("utm_source") || "", utm_medium: q.get("utm_medium") || "", utm_campaign: q.get("utm_campaign") || "",
      dispositivo: matchMedia("(pointer: coarse)").matches ? "movil" : "escritorio",
      web_url_trampa: campo("web_url_trampa") ? campo("web_url_trampa").value : "",
    });
    enviando = false;
    if (bueno) mostrar("enviado", "Te responderemos para confirmar alcance, plazo y precio.");
    else mostrar("manual", "No pudimos enviarla automáticamente. Cópiala y envíala por Instagram.");
  });

  copiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(mensaje);
      estado.textContent = "Copiado. Pégalo en el chat de Instagram.";
    } catch {
      const r = document.createRange();
      r.selectNodeContents(resumen);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      estado.textContent = "Selecciona y copia el texto de arriba.";
    }
  });
})();
