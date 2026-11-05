/* Panel privado: clientes del bot incrustable. Usa la misma clave que /admin (sessionStorage de esta pestaña). */
(() => {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const token = () => { try { return sessionStorage.getItem("adm") || ""; } catch { return ""; } };
  const api = (metodo, qs, cuerpo) => fetch("/api/admin/clientes" + (qs || ""), { method: metodo, headers: { Authorization: "Bearer " + token(), "Content-Type": "application/json" }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const ORIGEN = location.origin;
  const tabs = $("adm-tabs"), lista = $("adm-cli-lista"), form = $("adm-cli-form"), msg = $("adm-cli-msg"), leads = $("adm-cli-leads");
  let editando = false;

  function seccion(s) {
    tabs.querySelectorAll("[data-seccion]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.seccion === s)));
    $("adm-lista").hidden = s !== "sol";
    $("adm-cli").hidden = s !== "cli";
    if (s === "cli") cargar();
  }

  async function cargar() {
    lista.replaceChildren(); leads.replaceChildren();
    msg.textContent = "";
    try {
      const r = await api("GET");
      if (!r.ok) throw 0;
      const j = await r.json();
      if (!j.clientes.length) lista.append(el("p", "mute", "Aún no hay clientes. Crea el primero con «Nuevo cliente»."));
      for (const c of j.clientes) lista.append(tarjeta(c));
    } catch { lista.append(el("p", "mute", "No se pudieron cargar los clientes.")); }
  }

  function snippet(id) { return `<script src="${ORIGEN}/widget.js" data-cliente="${id}" defer></script>`; }

  function tarjeta(c) {
    const t = el("article", "adm-card");
    t.append(el("h2", null, c.nombre));
    t.append(el("p", "mute", `${c.id} · ${c.activo ? "ACTIVO" : "apagado"} · tope ${c.limite_diario}/día`));
    t.append(el("p", "mute", (c.dominios || []).join(", ")));
    const cod = el("code", "adm-code", snippet(c.id));
    t.append(cod);
    const fila = el("div", "cta");
    const bc = el("button", "btn ghost", "Copiar código"); bc.type = "button";
    bc.addEventListener("click", async () => { try { await navigator.clipboard.writeText(snippet(c.id)); bc.textContent = "Copiado"; } catch { bc.textContent = "Selecciona y copia"; } });
    const be = el("button", "btn ghost", "Editar"); be.type = "button"; be.addEventListener("click", () => editar(c.id));
    const bl = el("button", "btn ghost", "Ver clientes potenciales"); bl.type = "button"; bl.addEventListener("click", () => verLeads(c));
    fila.append(bc, be, bl); t.append(fila);
    return t;
  }

  async function verLeads(c) {
    leads.replaceChildren(el("h2", null, "Clientes potenciales de " + c.nombre));
    try {
      const r = await api("GET", "?leads=" + encodeURIComponent(c.id));
      if (!r.ok) throw 0;
      const j = await r.json();
      if (!j.leads.length) leads.append(el("p", "mute", "Todavía no dejaron datos."));
      for (const l of j.leads) {
        const a = el("article", "adm-card");
        a.append(el("h2", null, l.nombre), el("p", null, l.contacto), el("p", "mute", new Date(l.creado_en).toLocaleString("es-PE")));
        if (l.detalle) a.append(el("p", null, l.detalle));
        leads.append(a);
      }
      leads.scrollIntoView({ behavior: "smooth" });
    } catch { leads.append(el("p", "mute", "No se pudieron cargar.")); }
  }

  function abrirForm(c) {
    editando = !!c;
    $("adm-cli-titulo").textContent = c ? "Editar cliente" : "Nuevo cliente";
    $("c-id").value = c ? c.id : ""; $("c-id").readOnly = !!c;
    $("c-nombre").value = c ? c.nombre : ""; $("c-desc").value = c ? c.descripcion : "";
    $("c-saludo").value = c ? c.saludo : ""; $("c-wa").value = c ? c.whatsapp : "";
    $("c-color").value = c ? c.color.toLowerCase() : "#1e6bff";
    $("c-dom").value = c ? (c.dominios || []).join("\n") : ORIGEN === "null" ? "" : "";
    $("c-lim").value = c ? c.limite_diario : 300; $("c-act").checked = c ? !!c.activo : false;
    msg.textContent = ""; form.hidden = false; form.scrollIntoView({ behavior: "smooth" });
  }
  async function editar(id) {
    try {
      const r = await api("GET", "?id=" + encodeURIComponent(id));
      if (!r.ok) throw 0;
      abrirForm((await r.json()).cliente);
    } catch { msg.textContent = "No se pudo abrir el cliente."; }
  }

  $("adm-cli-nuevo").addEventListener("click", () => abrirForm(null));
  $("adm-cli-cancelar").addEventListener("click", () => { form.hidden = true; });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cuerpo = {
      id: $("c-id").value.trim(), nombre: $("c-nombre").value.trim(), descripcion: $("c-desc").value.trim(), saludo: $("c-saludo").value.trim(),
      whatsapp: $("c-wa").value.trim(), color: $("c-color").value, limite_diario: Number($("c-lim").value), activo: $("c-act").checked,
      dominios: $("c-dom").value.split("\n").map((x) => x.trim()).filter(Boolean),
    };
    msg.textContent = "Guardando…";
    try {
      const r = await api("POST", "", cuerpo);
      const j = await r.json().catch(() => ({}));
      if (r.ok) { msg.textContent = editando ? "Cambios guardados." : "Cliente creado."; form.hidden = true; cargar(); }
      else msg.textContent = "No se pudo guardar" + (j.error ? ` (revisa: ${j.error})` : ".");
    } catch { msg.textContent = "No se pudo guardar. Intenta de nuevo."; }
  });

  tabs.querySelectorAll("[data-seccion]").forEach((b) => b.addEventListener("click", () => seccion(b.dataset.seccion)));
  document.addEventListener("adm:ok", () => { tabs.hidden = false; seccion("sol"); });
})();
