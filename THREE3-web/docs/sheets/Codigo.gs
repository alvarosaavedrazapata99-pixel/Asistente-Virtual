/* GENERADO por scripts/leads/build-apps-script.js. No editar a mano. */
/* Núcleo anti-duplicados de leads. Mismo archivo en Node (pruebas y simulacro) y en Apps Script (Sheet maestro).
   Sin dependencias; sincrónico a propósito para correr dentro de un bloqueo. */
var LEADS = (function () {
  var SERVICIOS = ["sheets", "leads", "crm", "chatbot", "pack-automatiza", "personaje-basico", "personaje-completo", "videojuego"];

  function normEmail(v) {
    var e = String(v == null ? "" : v).trim().toLowerCase().replace(/\s+/g, "");
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : "";
  }
  /** Celular peruano: solo dígitos, sin 51, 9 dígitos que empiezan con 9. */
  function normCel(v) {
    var d = String(v == null ? "" : v).replace(/\D/g, "");
    if (d.length === 11 && d.indexOf("51") === 0) d = d.slice(2);
    return /^9\d{8}$/.test(d) ? d : "";
  }
  function normTexto(v) {
    return String(v == null ? "" : v).replace(/\s+/g, " ").trim();
  }
  function dia(iso) {
    return String(iso).slice(0, 10);
  }
  function claveSolicitud(idContacto, servicioId, iso) {
    return idContacto + "|" + servicioId + "|" + dia(iso);
  }

  /**
   * store: contactoPorEmail(e), contactoPorCel(c), crearContacto(o), actualizarContacto(id, o),
   *        solicitudPorClave(k), crearSolicitud(o), sumarDuplicado(k), vistoIdem(k), marcarIdem(k), auditar(ev, d)
   * Devuelve { estado: "creado" | "duplicado" | "reintento" | "invalido", ... }
   */
  function procesar(store, p, iso) {
    var nombre = normTexto(p.nombre);
    var email = normEmail(p.email);
    var cel = normCel(p.celular);
    var servicio = String(p.servicio_id || "");
    var idem = String(p.idempotency_key || "");

    var motivo = "";
    if (nombre.length < 2) motivo = "nombre";
    else if (!email && !cel) motivo = "contacto";
    else if (SERVICIOS.indexOf(servicio) < 0) motivo = "servicio";
    else if (p.consentimiento !== true) motivo = "consentimiento";
    if (motivo) {
      store.auditar("invalido", motivo);
      return { estado: "invalido", motivo: motivo };
    }

    if (idem && store.vistoIdem(idem)) {
      store.auditar("reintento", idem);
      return { estado: "reintento" };
    }

    var c = (email && store.contactoPorEmail(email)) || (cel && store.contactoPorCel(cel)) || null;
    var nuevoContacto = false;
    if (!c) {
      c = store.crearContacto({
        nombre: nombre, negocio: normTexto(p.negocio), email: email, celular: cel,
        clave: email || cel, ahora: iso, estado: "nuevo",
      });
      nuevoContacto = true;
    } else {
      store.actualizarContacto(c.id, { ahora: iso, email: email, celular: cel });
    }

    var clave = claveSolicitud(c.id, servicio, iso);
    var existente = store.solicitudPorClave(clave);
    if (idem) store.marcarIdem(idem);
    if (existente) {
      store.sumarDuplicado(clave);
      store.auditar("duplicado", clave);
      return { estado: "duplicado", id_contacto: c.id, clave: clave };
    }
    var s = store.crearSolicitud({
      id_contacto: c.id, servicio_id: servicio, detalle: normTexto(p.detalle), clave: clave, ahora: iso,
      utm_source: normTexto(p.utm_source) || "directo", utm_medium: normTexto(p.utm_medium) || "none",
      utm_campaign: normTexto(p.utm_campaign) || "none", dispositivo: normTexto(p.dispositivo), idem: idem,
    });
    store.auditar("creado", s.id);
    return { estado: "creado", id_contacto: c.id, id_solicitud: s.id, contacto_nuevo: nuevoContacto };
  }

  return { SERVICIOS: SERVICIOS, normEmail: normEmail, normCel: normCel, normTexto: normTexto, claveSolicitud: claveSolicitud, procesar: procesar };
})();
if (typeof module !== "undefined") module.exports = LEADS;

/* ===== Adaptador de Google Sheets (Apps Script) ===== */
var HOJAS = { contactos: "Contactos", solicitudes: "Solicitudes", servicios: "Servicios", auditoria: "Auditoria" };

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000); // una escritura a la vez: evita duplicados por concurrencia
  } catch (err) {
    return salida({ ok: false, error: "ocupado" });
  }
  try {
    var p = JSON.parse(e.postData.contents);
    if (p.web_url_trampa) return salida({ ok: true, estado: "reintento" }); // campo trampa para bots
    var r = LEADS.procesar(crearStoreSheet(), p, new Date().toISOString());
    return salida({ ok: r.estado !== "invalido", estado: r.estado, motivo: r.motivo || "" });
  } catch (err) {
    return salida({ ok: false, error: "error" });
  } finally {
    lock.releaseLock();
  }
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function crearStoreSheet() {
  var ss = SpreadsheetApp.getActive();
  var hC = ss.getSheetByName(HOJAS.contactos), hS = ss.getSheetByName(HOJAS.solicitudes);
  var hSv = ss.getSheetByName(HOJAS.servicios), hA = ss.getSheetByName(HOJAS.auditoria);
  var nC = Math.max(hC.getLastRow() - 1, 0), nS = Math.max(hS.getLastRow() - 1, 0);
  var cs = nC ? hC.getRange(2, 1, nC, 12).getValues() : [];
  var ss2 = nS ? hS.getRange(2, 1, nS, 18).getValues() : [];
  var sv = hSv.getRange(2, 1, Math.max(hSv.getLastRow() - 1, 1), 2).getValues();
  var nombreServicio = {}; sv.forEach(function (f) { nombreServicio[f[0]] = f[1]; });
  var porEmail = {}, porCel = {}, fila = {}, solPorClave = {}, idem = {};
  cs.forEach(function (f, i) { var c = { id: f[0], row: i + 2 }; if (f[3]) porEmail[f[3]] = c; if (f[4]) porCel[f[4]] = c; fila[f[0]] = c; });
  ss2.forEach(function (f, i) { solPorClave[f[15]] = { row: i + 2 }; if (f[16]) idem[f[16]] = 1; });
  var ultimoDetalle = "";

  return {
    contactoPorEmail: function (e) { return porEmail[e] || null; },
    contactoPorCel: function (c) { return porCel[c] || null; },
    crearContacto: function (o) {
      var id = "C-" + ("000000" + (++nC)).slice(-6);
      hC.appendRow([id, o.nombre, o.negocio, o.email, o.celular, o.clave, o.ahora, o.ahora, 0, o.ahora, o.estado, ""]);
      var c = { id: id, row: hC.getLastRow() };
      if (o.email) porEmail[o.email] = c; if (o.celular) porCel[o.celular] = c; fila[id] = c;
      return c;
    },
    actualizarContacto: function (id, o) {
      var r = fila[id].row; hC.getRange(r, 8).setValue(o.ahora);
      if (o.email && !hC.getRange(r, 4).getValue()) { hC.getRange(r, 4).setValue(o.email); porEmail[o.email] = fila[id]; }
      if (o.celular && !hC.getRange(r, 5).getValue()) { hC.getRange(r, 5).setValue(o.celular); porCel[o.celular] = fila[id]; }
    },
    solicitudPorClave: function (k) { return solPorClave[k] || null; },
    crearSolicitud: function (o) {
      var id = "S-" + ("000000" + (++nS)).slice(-6);
      hS.appendRow([id, o.ahora, o.id_contacto, o.servicio_id, nombreServicio[o.servicio_id] || "", o.detalle, o.utm_source, o.utm_campaign, o.utm_medium, o.dispositivo, "nueva", "", "", "", "", o.clave, o.idem, 0]);
      solPorClave[o.clave] = { row: hS.getLastRow() };
      var r = fila[o.id_contacto].row, celda = hC.getRange(r, 9); celda.setValue((Number(celda.getValue()) || 0) + 1);
      ultimoDetalle = id; return { id: id };
    },
    sumarDuplicado: function (k) { var celda = hS.getRange(solPorClave[k].row, 18); celda.setValue((Number(celda.getValue()) || 0) + 1); },
    vistoIdem: function (k) { return !!idem[k]; },
    marcarIdem: function (k) { idem[k] = 1; },
    auditar: function (ev, d) { hA.appendRow([new Date().toISOString(), ev, "", "", String(d || ""), "web", ""]); },
  };
}
