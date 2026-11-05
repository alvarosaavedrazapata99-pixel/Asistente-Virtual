/* Panel privado: pestañas «Diagnósticos» (clientes clasificados por interés) y «Costos» (gasto real de IA, calculadora y mapa de costos). */
(() => {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const token = () => { try { return sessionStorage.getItem("adm") || ""; } catch { return ""; } };
  const api = (ruta, metodo, cuerpo) => fetch(ruta, { method: metodo || "GET", headers: { Authorization: "Bearer " + token(), "Content-Type": "application/json" }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const C = window.COSTOS;
  const usd = (n) => "US$ " + Number(n).toLocaleString("en-US", { minimumFractionDigits: n < 1 ? 4 : 2, maximumFractionDigits: n < 1 ? 4 : 2 });
  const pen = (n) => "S/ " + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });

  // ───────── Diagnósticos ─────────
  const NIVEL = { muy: "Muy interesado", interesado: "Interesado", explorando: "Explorando" };
  const ORDEN = { muy: 0, interesado: 1, explorando: 2 };
  const ESTADOS = ["nuevo", "contactado", "cotizado", "cliente", "descartado"];
  let filtro = "todos", diags = [];
  async function cargarDiag() {
    const cont = $("adm-diag"); cont.replaceChildren(el("p", "mute", "Cargando…"));
    try { const r = await api("/api/admin/diagnosticos"); if (!r.ok) throw 0; diags = (await r.json()).diagnosticos; pintarDiag(); }
    catch { cont.replaceChildren(el("p", "mute", "No se pudieron cargar los diagnósticos. ¿Ya ejecutaste la migración 0004 en Supabase?")); }
  }
  function pintarDiag() {
    const cont = $("adm-diag"); cont.replaceChildren();
    cont.append(el("p", "mute", "Cada persona que hace el diagnóstico queda clasificada. Llama primero a los «muy interesados»."));
    const barra = el("div", "adm-tabs");
    for (const [k, t] of [["todos", "Todos"], ["muy", "Muy interesados"], ["interesado", "Interesados"], ["explorando", "Explorando"]]) {
      const n = k === "todos" ? diags.length : diags.filter((d) => d.interes === k).length;
      const b = el("button", "btn ghost", `${t} (${n})`); b.type = "button"; b.setAttribute("aria-selected", String(filtro === k));
      b.addEventListener("click", () => { filtro = k; pintarDiag(); }); barra.append(b);
    }
    cont.append(barra);
    const lista = diags.filter((d) => filtro === "todos" || d.interes === filtro).sort((a, b) => ORDEN[a.interes] - ORDEN[b.interes] || b.id - a.id);
    if (!lista.length) cont.append(el("p", "mute", "Aún no hay diagnósticos en esta lista."));
    for (const d of lista) {
      const c = d.contactos || {}, r = d.resultado || {};
      const t = el("article", "adm-card");
      const fila = el("p", "adm-fila"); fila.append(el("span", "adm-niv n-" + d.interes, NIVEL[d.interes] || d.interes), el("span", "mute", ` ${d.puntos} pts · ${new Date(d.creado_en).toLocaleString("es-PE")}`)); t.append(fila);
      t.append(el("h2", null, c.nombre || "(sin nombre)"));
      if (c.negocio) t.append(el("p", "mute", c.negocio));
      t.append(el("p", null, `${r.rubroNombre || d.rubro} · automatización ${d.madurez}/100 · ~${r.consultas || "?"} consultas/mes (≈${r.perdidas || 0} podrían quedar sin atender)`));
      t.append(el("p", "mute", `Plan sugerido: ${d.plan_sugerido}${r.modulo ? " + módulo de leads y CRM" : ""}`));
      const f2 = el("p");
      if (c.celular_norm) { const a = el("a", null, "WhatsApp " + c.celular_norm); a.href = "https://wa.me/" + (c.celular_norm.length === 9 ? "51" : "") + c.celular_norm.replace(/\D/g, ""); a.target = "_blank"; a.rel = "noopener noreferrer"; f2.append(a, " "); }
      if (c.email_norm) { const a = el("a", null, c.email_norm); a.href = "mailto:" + c.email_norm; f2.append(a); }
      t.append(f2);
      const sel = el("select"); sel.setAttribute("aria-label", "Estado");
      for (const e of ESTADOS) { const o = el("option", null, e); o.value = e; if (e === d.estado) o.selected = true; sel.append(o); }
      sel.addEventListener("change", async () => { sel.disabled = true; try { await api("/api/admin/diagnosticos", "PATCH", { id: d.id, estado: sel.value }); } catch {} sel.disabled = false; });
      t.append(sel); cont.append(t);
    }
  }

  // ───────── Costos ─────────
  const MAPA = [
    ["IA (Anthropic API)", "Variable", "Se paga por tokens, aparte de cualquier suscripción de Claude. Haiku 5.5: US$ 0,10 por millón de entrada y US$ 0,50 de salida. Sonnet 5.5: US$ 2 y US$ 10.", "Depende del uso. Mira la calculadora."],
    ["Claude Pro / Max / Team (suscripción)", "Fijo", "Es para usar Claude en chat y Claude Code. NO incluye créditos de la API: la API se recarga aparte en la consola.", "Según el plan que elijas; ver precios vigentes en claude.com."],
    ["Cloudflare (web, dominio, Workers)", "Casi fijo", "El plan gratis alcanza para empezar. El plan de pago de Workers (referencia: ~US$ 5/mes) da más margen cuando crezca el tráfico.", "~US$ 0 a 5/mes (verifica)."],
    ["Dominio (three3agency.com)", "Anual", "Renovación anual en Cloudflare, sin recargo (cerca de S/ 45 al año).", "~S/ 45/año."],
    ["Supabase (base de datos)", "Fijo", "Plan gratis para empezar. Ojo: los proyectos gratis se pausan tras una semana sin actividad. Antes de vender, pasa a Pro (referencia: ~US$ 25/mes).", "US$ 0 → ~25/mes (verifica)."],
    ["Resend (correos del diagnóstico)", "Casi fijo", "Plan gratis con unos 3 000 correos al mes (referencia). Necesitas verificar tu dominio para enviar desde @three3agency.com.", "~US$ 0 a 20/mes (verifica)."],
    ["WhatsApp (Meta)", "Variable", "Lo cobra Meta directo a la tarjeta del cliente, como dicen tus planes. Las respuestas dentro de las 24 horas a un mensaje del cliente suelen ser gratis; las plantillas para escribir tú primero sí se cobran por mensaje según el país.", "Del cliente. Consulta la tarifa de Perú en Meta."],
    ["Hosting de cada cliente", "Por cliente", "El bot incrustable corre en tu mismo Cloudflare: no necesitas un hosting por cliente. Si el cliente pide página web propia, su dominio y hosting van por su cuenta (como indican tus planes).", "Del cliente."],
  ];
  async function cargarCostos() {
    const cont = $("adm-costos"); cont.replaceChildren();
    cont.append(el("h2", null, "Gasto real de IA"));
    const real = el("div"); real.append(el("p", "mute", "Cargando…")); cont.append(real);
    const tc = el("label", null, "Tipo de cambio (S/ por US$) "); const tcIn = el("input"); tcIn.type = "number"; tcIn.step = "0.01"; tcIn.value = "3.5"; tcIn.style.width = "90px"; tc.append(tcIn);
    cont.append(tc);
    try {
      const r = await api("/api/admin/uso"); if (!r.ok) throw 0; const filas = (await r.json()).filas;
      const pintarReal = () => {
        real.replaceChildren();
        if (!filas.length) { real.append(el("p", "mute", "Aún no hay consumo registrado (la IA está apagada o no se ejecutó la migración 0005).")); return; }
        const t = el("table", "adm-tabla"); const h = el("tr"); for (const x of ["Mes", "Cliente", "Origen", "Modelo", "Llamadas", "Tokens entrada", "Tokens salida", "Costo US$", "Costo S/"]) h.append(el("th", null, x)); t.append(h);
        let total = 0;
        for (const f of filas) { const c = C.costoUSD(f.modelo, f.tin, f.tout, f.tcache); total += c || 0; const tr = el("tr"); for (const x of [String(f.mes).slice(0, 7), f.cliente || "(propio)", f.origen, f.modelo, f.llamadas, f.tin, f.tout, c == null ? "?" : usd(c), c == null ? "?" : pen(c * Number(tcIn.value || 3.5))]) tr.append(el("td", null, String(x))); t.append(tr); }
        real.append(t, el("p", null, `Total listado: ${usd(total)} (${pen(total * Number(tcIn.value || 3.5))})`));
      };
      pintarReal(); tcIn.addEventListener("input", pintarReal);
    } catch { real.replaceChildren(el("p", "mute", "No se pudo cargar el consumo.")); }

    // Calculadora
    cont.append(el("h2", null, "Calculadora: ¿cuánto cuesta cada cliente y cuánto queda?"));
    const form = el("div", "adm-calc");
    const campo = (rot, id, val, tipo, ops) => { const l = el("label", null, rot); let i; if (ops) { i = el("select"); for (const [v, t] of ops) { const o = el("option", null, t); o.value = v; i.append(o); } i.value = val; } else { i = el("input"); i.type = tipo || "number"; i.value = val; i.step = "any"; } i.id = id; l.append(i); form.append(l); return i; };
    const modelos = Object.entries(C.PRECIOS).map(([k, v]) => [k, v.nombre]);
    campo("Modelo de IA", "k-mod", "claude-haiku-5-5", null, modelos);
    campo("Clientes con bot", "k-cli", 10); campo("Conversaciones por cliente al mes", "k-conv", 300); campo("Mensajes por conversación", "k-msg", 8);
    campo("Tokens de las instrucciones del bot (descripción del negocio incluida)", "k-sis", 1000); campo("Mensualidad que cobras por cliente (S/)", "k-men", 450, null, [["450", "Inicial: S/ 450"], ["750", "Profesional: S/ 750"], ["1200", "Avanzado: S/ 1 200"], ["250", "Módulo leads y CRM: S/ 250"]]);
    campo("Costos fijos al mes (US$): Supabase, Cloudflare, Resend…", "k-fij", 45); campo("Tipo de cambio (S/ por US$)", "k-tc", 3.5);
    cont.append(form);
    const sal = el("div", "demo-kpis"); cont.append(sal);
    const nota = el("p", "mute", "Supuestos: respuesta de ~220 tokens (incluye el pensamiento), cada mensaje reenvía las instrucciones y hasta 7 turnos previos. Sin caché de prompt. Los precios son los de la tabla pública de Anthropic consultada el 2026-10-06; verifícalos antes de fijar tarifas."); cont.append(nota);
    const calc = () => {
      const v = (id) => Number($(id).value);
      const e = C.estimar({ modelo: $("k-mod").value, sistema: v("k-sis"), turno: 70, pregunta: 40, respuesta: 220, msgs: v("k-msg"), conversaciones: v("k-conv"), clientes: v("k-cli"), mensualidadPEN: v("k-men"), tc: v("k-tc") || 3.5, fijosUSD: v("k-fij") });
      sal.replaceChildren();
      const datos = [["Costo de IA por conversación", usd(e.porConversacion.usd)], ["Costo de IA por cliente al mes", `${usd(e.porClienteUSD)} (${pen(e.porClientePEN)})`], ["% de la mensualidad que se va en IA", (e.pctIA * 100).toFixed(1) + " %"], ["Tokens al mes (toda la cartera)", Math.round(e.tokensMes).toLocaleString("en-US")], ["Costo de IA de toda la cartera", `${usd(e.totalUSD)} (${pen(e.totalPEN)})`], ["Ingreso por mensualidades", `${usd(e.ingresoUSD)} (${pen(v("k-men") * v("k-cli"))})`], ["Utilidad estimada al mes (después de IA y fijos)", `${usd(e.utilidadUSD)} (${pen(e.utilidadUSD * (v("k-tc") || 3.5))})`]];
      for (const [t, n] of datos) { const d = el("div", "demo-kpi"); d.append(el("b", null, n), el("span", "mute", t)); sal.append(d); }
    };
    form.addEventListener("input", calc); calc();

    // Mapa de costos
    cont.append(el("h2", null, "Mapa de costos"));
    const t = el("table", "adm-tabla"); const h = el("tr"); for (const x of ["Concepto", "Tipo", "Qué es", "Orden de magnitud"]) h.append(el("th", null, x)); t.append(h);
    for (const f of MAPA) { const tr = el("tr"); for (const x of f) tr.append(el("td", null, x)); t.append(tr); }
    cont.append(t, el("p", "mute", "Las cifras marcadas «verifica» son referencias que no se consultaron hoy en la página oficial de cada proveedor."));
  }

  document.addEventListener("adm:seccion", (e) => { if (e.detail === "diag") cargarDiag(); if (e.detail === "costos") cargarCostos(); });
})();
