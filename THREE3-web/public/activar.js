/* Flujo "Activar": abre el formulario, valida y arma la solicitud lista para enviar.
   Sin servidor todavía: la persona copia su solicitud y la envía por Instagram. */
(() => {
  const d = document.getElementById("activar");
  if (!d || typeof d.showModal !== "function") return;
  const form = d.querySelector("form");
  const ok = d.querySelector("[data-ok]");
  const resumen = d.querySelector("[data-resumen]");
  const copiar = d.querySelector("[data-copiar]");
  const estado = d.querySelector("[data-estado]");
  let ultimo = null;
  let mensaje = "";

  const campo = (n) => form.elements[n];
  const error = (n, t) => {
    const el = form.querySelector(`[data-err="${n}"]`);
    if (el) el.textContent = t;
    const c = campo(n);
    if (c) c.setAttribute("aria-invalid", t ? "true" : "false");
  };

  function abrir(servicio, disparador) {
    ultimo = disparador;
    form.reset();
    ["nombre", "contacto", "acepto"].forEach((n) => error(n, ""));
    ok.hidden = true;
    form.hidden = false;
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
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
    const nombreServicio = s.options[s.selectedIndex].text;
    const negocio = campo("negocio").value.trim();
    const detalle = campo("detalle").value.trim();
    mensaje = [
      `Hola THREE3, quiero cotizar: ${nombreServicio}.`,
      `Nombre: ${nombre}`,
      negocio ? `Negocio: ${negocio}` : "",
      `Contacto: ${contacto}`,
      detalle ? `Detalle: ${detalle}` : "",
    ].filter(Boolean).join("\n");
    resumen.textContent = mensaje;
    estado.textContent = "";
    form.hidden = true;
    ok.hidden = false;
    ok.querySelector("h2").focus();
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
