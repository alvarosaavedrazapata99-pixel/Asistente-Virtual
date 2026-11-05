/* Panel privado de solicitudes. La clave se guarda solo en esta pestaña (sessionStorage) y se envía únicamente como cabecera Authorization. */
(() => {
  const form = document.getElementById("adm-form");
  const clave = document.getElementById("adm-clave");
  const estado = document.getElementById("adm-estado");
  const lista = document.getElementById("adm-lista");
  const ESTADOS = ["nueva", "contactada", "cotizada", "aceptada", "perdida"];
  let token = "";
  try { token = sessionStorage.getItem("adm") || ""; } catch {}

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const api = (metodo, cuerpo) => fetch("/api/admin/leads", { method: metodo, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });

  function tarjeta(l) {
    const c = l.contactos || {};
    const t = el("article", "adm-card");
    t.append(el("h2", null, c.nombre || "(sin nombre)"));
    if (c.negocio) t.append(el("p", "mute", c.negocio));
    const fila = el("p", null, "");
    if (c.celular_norm) {
      const a = el("a", null, "WhatsApp " + c.celular_norm);
      a.href = "https://wa.me/" + (c.celular_norm.length === 9 ? "51" : "") + c.celular_norm.replace(/\D/g, "");
      a.target = "_blank"; a.rel = "noopener noreferrer";
      fila.append(a, " ");
    }
    if (c.email_norm) {
      const a = el("a", null, c.email_norm);
      a.href = "mailto:" + c.email_norm;
      fila.append(a);
    }
    t.append(fila);
    t.append(el("p", "mute", l.servicio_id + " · " + new Date(l.creado_en).toLocaleString("es-PE") + (l.intentos_duplicados ? " · reenvió " + l.intentos_duplicados + " vez" : "") + " · " + l.utm_source + "/" + l.utm_campaign));
    if (l.detalle) t.append(el("p", null, l.detalle));
    const sel = el("select");
    sel.setAttribute("aria-label", "Estado");
    for (const e of ESTADOS) { const o = el("option", null, e); o.value = e; if (e === l.estado) o.selected = true; sel.append(o); }
    sel.addEventListener("change", async () => {
      sel.disabled = true;
      try { const r = await api("PATCH", { id: l.id, estado: sel.value }); if (!r.ok) throw 0; } catch { estado.textContent = "No se pudo cambiar el estado."; }
      sel.disabled = false;
    });
    t.append(sel);
    const pres = el("button", "btn ghost", "Presentar");
    pres.type = "button";
    pres.addEventListener("click", () => {
      // Los datos viajan solo dentro de esta pestaña (sessionStorage); nunca en la dirección.
      try { sessionStorage.setItem("deck", JSON.stringify({ nombre: c.nombre || "", negocio: c.negocio || "", detalle: l.detalle || "", servicio: l.servicio_id })); } catch {}
      location.href = "/presentacion";
    });
    t.append(pres);
    return t;
  }

  async function cargar() {
    estado.textContent = "Cargando…";
    lista.replaceChildren();
    try {
      const r = await api("GET");
      if (r.status === 401) { estado.textContent = "Clave incorrecta."; token = ""; try { sessionStorage.removeItem("adm"); } catch {} return; }
      if (!r.ok) throw 0;
      const j = await r.json();
      estado.textContent = j.leads.length ? j.leads.length + " solicitudes (las 100 más recientes)" : "Aún no hay solicitudes.";
      for (const l of j.leads) lista.append(tarjeta(l));
      form.hidden = true;
      document.dispatchEvent(new CustomEvent("adm:ok"));
    } catch { estado.textContent = "No se pudo cargar. Intenta de nuevo."; }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    token = clave.value.trim();
    clave.value = "";
    try { sessionStorage.setItem("adm", token); } catch {}
    cargar();
  });
  if (token) cargar();
})();
