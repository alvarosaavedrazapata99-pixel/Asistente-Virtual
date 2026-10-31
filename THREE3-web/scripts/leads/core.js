/* Núcleo anti-duplicados de leads. Mismo archivo en Node (pruebas y simulacro) y en Apps Script (Sheet maestro).
   Sin dependencias; sincrónico a propósito para correr dentro de un bloqueo. */
var LEADS = (function () {
  var SERVICIOS = ["sheets", "leads", "crm", "chatbot", "pack-automatiza", "personaje-basico", "personaje-completo", "videojuego"];

  function normEmail(v) {
    var e = String(v == null ? "" : v).trim().toLowerCase().replace(/\s+/g, "");
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : "";
  }
  /** Celular: peruano (9 dígitos que empiezan con 9, con o sin 51) o internacional con "+" (8 a 15 dígitos, formato E.164). */
  function normCel(v) {
    var crudo = String(v == null ? "" : v).trim();
    var d = crudo.replace(/\D/g, "");
    if (crudo.charAt(0) === "+" && d.indexOf("51") !== 0) return d.length >= 8 && d.length <= 15 ? "+" + d : "";
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
