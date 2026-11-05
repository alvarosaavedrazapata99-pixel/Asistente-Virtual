/* Costos de la IA de THREE3. Precios de la API de Anthropic en dólares por millón de tokens (consultados el 2026-10-06; verifícalos en
   https://platform.claude.com/docs/en/about-claude/pricing antes de fijar tarifas). Mismo archivo en el navegador (window.COSTOS) y en pruebas. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.COSTOS = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // cache = lectura de caché (≈ 0,1 × entrada). Haiku 5.5: hasta 100K de prompt; por encima cambia la tarifa (no aplica a estos chats).
  var PRECIOS = {
    "claude-haiku-5-5": { nombre: "Claude Haiku 5.5", ent: 0.10, sal: 0.50, cache: 0.01 },
    "claude-sonnet-5-5": { nombre: "Claude Sonnet 5.5", ent: 2.0, sal: 10.0, cache: 0.20 },
    "claude-opus-5-5": { nombre: "Claude Opus 5.5", ent: 4.0, sal: 20.0, cache: 0.20 },
  };
  function costoUSD(modelo, tin, tout, tcache) {
    var p = PRECIOS[modelo];
    if (!p) return null;
    return ((tin || 0) * p.ent + (tout || 0) * p.sal + (tcache || 0) * p.cache) / 1e6;
  }
  /** Tokens y costo de UNA conversación. Cada mensaje reenvía el sistema y hasta 7 turnos previos, así que la entrada crece por mensaje. */
  function conversacion(o) {
    var tin = 0, tout = 0, hist = 0;
    for (var i = 0; i < o.msgs; i++) {
      tin += o.sistema + Math.min(hist, 7 * o.turno) + o.pregunta;
      tout += o.respuesta;
      hist = Math.min(hist + o.pregunta + o.respuesta, 7 * o.turno);
    }
    return { tin: tin, tout: tout, usd: costoUSD(o.modelo, tin, tout, 0) };
  }
  /** Mes de un cliente y de toda la cartera, con margen frente a la mensualidad que se le cobra. */
  function estimar(o) {
    var c = conversacion(o);
    var porCliente = c.usd * o.conversaciones;
    var costoTotal = porCliente * o.clientes;
    var ingresoUSD = (o.mensualidadPEN * o.clientes) / o.tc;
    var fijosUSD = o.fijosUSD || 0;
    return {
      porConversacion: c, porClienteUSD: porCliente, porClientePEN: porCliente * o.tc, totalUSD: costoTotal, totalPEN: costoTotal * o.tc,
      tokensMes: (c.tin + c.tout) * o.conversaciones * o.clientes,
      margenClienteUSD: o.mensualidadPEN / o.tc - porCliente - (o.clientes ? fijosUSD / o.clientes : 0),
      ingresoUSD: ingresoUSD, utilidadUSD: ingresoUSD - costoTotal - fijosUSD,
      pctIA: o.mensualidadPEN ? (porCliente * o.tc) / o.mensualidadPEN : 0,
    };
  }
  return { PRECIOS: PRECIOS, costoUSD: costoUSD, conversacion: conversacion, estimar: estimar };
});
