
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
    if (p.tipo === "vista" || p.tipo === "click") return salida({ ok: registrarEvento(p) }); // medición anónima de /ig
    if (p.web_url_trampa) return salida({ ok: true, estado: "reintento" }); // campo trampa para bots
    var r = LEADS.procesar(crearStoreSheet(), p, new Date().toISOString());
    return salida({ ok: r.estado !== "invalido", estado: r.estado, motivo: r.motivo || "" });
  } catch (err) {
    return salida({ ok: false, error: "error" });
  } finally {
    lock.releaseLock();
  }
}

function registrarEvento(p) {
  var corto = function (v, n) { return String(v == null ? "" : v).slice(0, n); };
  if (!/^[a-z0-9:_-]{1,60}$/.test(String(p.evento || ""))) return false; // solo etiquetas simples: evita basura
  SpreadsheetApp.getActive().getSheetByName("Eventos").appendRow([
    new Date().toISOString(), p.tipo, p.evento, corto(p.pagina, 80), corto(p.utm_source, 40), corto(p.utm_medium, 40), corto(p.utm_campaign, 60), corto(p.dispositivo, 12),
  ]);
  return true;
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
