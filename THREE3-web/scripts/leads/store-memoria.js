/* Almacén en memoria con la misma interfaz que el del Sheet. Se usa en pruebas y en el simulacro. */
function crearStore() {
  var contactos = {}, porEmail = {}, porCel = {}, solicitudes = {}, idem = {};
  var nC = 0, nS = 0, log = { creado: 0, duplicado: 0, reintento: 0, invalido: 0 };
  return {
    contactoPorEmail: function (e) { return porEmail[e] || null; },
    contactoPorCel: function (c) { return porCel[c] || null; },
    crearContacto: function (o) {
      var c = { id: "C-" + String(++nC).padStart(6, "0"), email: o.email, celular: o.celular, total: 0 };
      contactos[c.id] = c; if (o.email) porEmail[o.email] = c; if (o.celular) porCel[o.celular] = c;
      return c;
    },
    actualizarContacto: function (id, o) {
      var c = contactos[id];
      if (o.email && !c.email) { c.email = o.email; porEmail[o.email] = c; }
      if (o.celular && !c.celular) { c.celular = o.celular; porCel[o.celular] = c; }
    },
    solicitudPorClave: function (k) { return solicitudes[k] || null; },
    crearSolicitud: function (o) {
      var s = { id: "S-" + String(++nS).padStart(6, "0"), clave: o.clave, intentos: 0, fuente: o.utm_campaign };
      solicitudes[o.clave] = s; contactos[o.id_contacto].total++; return s;
    },
    sumarDuplicado: function (k) { solicitudes[k].intentos++; },
    vistoIdem: function (k) { return !!idem[k]; },
    marcarIdem: function (k) { idem[k] = 1; },
    auditar: function (ev) { log[ev]++; },
    resumen: function () {
      var dup = 0, porFuente = {};
      Object.keys(solicitudes).forEach(function (k) { dup += solicitudes[k].intentos; porFuente[solicitudes[k].fuente] = (porFuente[solicitudes[k].fuente] || 0) + 1; });
      return { contactos: Object.keys(contactos).length, solicitudes: Object.keys(solicitudes).length, duplicadosBloqueados: dup, log: log, porFuente: porFuente };
    },
  };
}
module.exports = { crearStore };
