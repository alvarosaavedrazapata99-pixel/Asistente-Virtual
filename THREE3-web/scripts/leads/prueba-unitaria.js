const assert = require("assert");
const L = require("./core.js");
const { crearStore } = require("./store-memoria.js");
const T = "2026-10-31T10:00:00.000Z";
// normalización
assert.equal(L.normEmail("  ANA@Mail.COM "), "ana@mail.com");
assert.equal(L.normEmail("sin-arroba"), "");
assert.equal(L.normCel("+51 987-654-321"), "987654321");
assert.equal(L.normCel("987 654 321"), "987654321");
assert.equal(L.normCel("51987654321"), "987654321");
assert.equal(L.normCel("12345"), "");
assert.equal(L.normCel("887654321"), ""); // no empieza con 9
// flujo
const s = crearStore();
const base = { nombre: "Ana  Pérez", email: "ANA@mail.com", servicio_id: "crm", consentimiento: true, idempotency_key: "k1" };
assert.equal(L.procesar(s, base, T).estado, "creado");
assert.equal(L.procesar(s, base, T).estado, "reintento", "misma idempotency_key");
assert.equal(L.procesar(s, { ...base, idempotency_key: "k2", email: " ana@MAIL.com" }, T).estado, "duplicado", "mismo contacto+servicio+día");
assert.equal(L.procesar(s, { ...base, idempotency_key: "k3", servicio_id: "chatbot" }, T).estado, "creado", "otro servicio = otra solicitud");
assert.equal(L.procesar(s, { ...base, idempotency_key: "k4" }, "2026-11-01T01:00:00.000Z").estado, "creado", "otro día = nueva solicitud");
assert.equal(L.procesar(s, { ...base, idempotency_key: "k5", email: "", celular: "987654321" }, T).estado, "creado", "otro identificador = contacto distinto (limitación conocida)");
assert.equal(L.procesar(s, { ...base, idempotency_key: "k6", consentimiento: false, email: "x@y.com" }, T).motivo, "consentimiento");
assert.equal(L.procesar(s, { ...base, idempotency_key: "k7", servicio_id: "hack", email: "z@y.com" }, T).motivo, "servicio");
assert.equal(L.procesar(s, { ...base, idempotency_key: "k8", nombre: "A", email: "q@y.com" }, T).motivo, "nombre");
const r = s.resumen();
assert.equal(r.contactos, 2); assert.equal(r.solicitudes, 4); assert.equal(r.duplicadosBloqueados, 1);
console.log("OK: 17 comprobaciones pasaron", JSON.stringify(r.log));
