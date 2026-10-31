/* Simulacro de llegada de leads: bots en paralelo con duplicados, reintentos y datos inválidos.
   Compara el procesador con bloqueo (el del Sheet) contra uno ingenuo (sin bloqueo). */
const fs = require("fs");
const L = require("./core.js");
const { crearStore } = require("./store-memoria.js");

const arg = (n, d) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? Number(a.split("=")[1]) : d; };
const PERSONAS = arg("personas", 1500), CONCURRENCIA = arg("concurrencia", 200), LAT_MS = arg("latencia", 1), SEED = arg("semilla", 7);
const rng = (() => { let a = SEED; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
const pick = (a) => a[Math.floor(rng() * a.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CAMP = [["instagram", "ads", "campana-1"], ["instagram", "reel", "automatizacion"], ["instagram", "bio", "link-bio"], ["directo", "none", "none"]];

// ---- generar eventos y verdad de referencia
const eventos = [], pares = new Set(), contactosVerdad = PERSONAS;
let nIdem = 0;
const verdadCamp = {};
for (let i = 0; i < PERSONAS; i++) {
  const tipo = rng(), email = `persona${i}@correo${i % 40}.com`, cel = "9" + String(10000000 + i).padStart(8, "0");
  const ids = tipo < 0.4 ? { email } : tipo < 0.7 ? { celular: cel } : { email, celular: cel };
  const camp = pick(CAMP);
  const nServ = rng() < 0.3 ? 2 : 1, servs = [...L.SERVICIOS].sort(() => rng() - 0.5).slice(0, nServ);
  const dias = rng() < 0.2 ? ["2026-11-02", "2026-11-03"] : ["2026-11-02"];
  for (const s of servs) for (const d of dias) {
    pares.add(`${i}|${s}|${d}`);
    verdadCamp[camp[2]] = (verdadCamp[camp[2]] || 0) + 1;
    const r = rng(), intentos = r < 0.6 ? 1 : r < 0.85 ? 2 : 4;
    let keyDoble = `k${++nIdem}`;
    for (let k = 0; k < intentos; k++) {
      const variante = {
        ...(ids.email ? { email: pick([ids.email, ids.email.toUpperCase(), " " + ids.email + " "]) } : {}),
        ...(ids.celular ? { celular: pick([ids.celular, "+51 " + ids.celular.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3"), ids.celular.replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3"), "51" + ids.celular]) } : {}),
      };
      const dobleClic = intentos === 4 && k < 2; // los 2 primeros comparten idempotency_key
      eventos.push({ p: { nombre: `Persona  ${i}`, ...variante, servicio_id: s, consentimiento: true, utm_source: camp[0], utm_medium: camp[1], utm_campaign: camp[2], idempotency_key: dobleClic ? keyDoble : `k${++nIdem}` }, iso: `${d}T${String(8 + Math.floor(rng() * 12)).padStart(2, "0")}:00:00.000Z`, valido: true });
    }
  }
}
const nValidos = eventos.length;
for (let j = 0; j < Math.round(nValidos * 0.05); j++) {
  const mal = j % 3;
  eventos.push({ p: { nombre: "Bot", email: mal === 0 ? "no-es-correo" : `x${j}@y.com`, servicio_id: mal === 1 ? "inexistente" : "crm", consentimiento: mal === 2 ? false : true, idempotency_key: `bad${j}` }, iso: "2026-11-02T10:00:00.000Z", valido: false });
}
eventos.sort(() => rng() - 0.5);

// ---- ejecución concurrente
async function correr(nombre, handler) {
  const store = crearStore(), cola = eventos.slice(), lat = [], t0 = process.hrtime.bigint();
  let mutex = Promise.resolve();
  const bloqueado = (fn) => { const r = mutex.then(fn); mutex = r.catch(() => {}); return r; };
  const ctx = { store, bloqueado };
  async function worker() {
    while (cola.length) {
      const e = cola.shift(), t = process.hrtime.bigint();
      await handler(ctx, e);
      lat.push(Number(process.hrtime.bigint() - t) / 1e6);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCIA }, worker));
  const seg = Number(process.hrtime.bigint() - t0) / 1e9;
  lat.sort((a, b) => a - b);
  return { nombre, seg, rps: eventos.length / seg, p50: lat[Math.floor(lat.length * 0.5)], p95: lat[Math.floor(lat.length * 0.95)], max: lat[lat.length - 1], ...store.resumen() };
}
// con bloqueo: lo que hará el Sheet (LockService): una escritura a la vez
const conBloqueo = (ctx, e) => ctx.bloqueado(async () => { L.procesar(ctx.store, e.p, e.iso); await sleep(LAT_MS); });
// ingenuo: revisa y escribe con tiempo entre ambos pasos, sin bloqueo
const ingenuo = async (ctx, e) => {
  const s = ctx.store, p = e.p, email = L.normEmail(p.email), cel = L.normCel(p.celular);
  if (!L.normTexto(p.nombre) || (!email && !cel) || L.SERVICIOS.indexOf(p.servicio_id) < 0 || p.consentimiento !== true) return s.auditar("invalido");
  let c = (email && s.contactoPorEmail(email)) || (cel && s.contactoPorCel(cel));
  await sleep(LAT_MS);
  if (!c) c = s.crearContacto({ email, celular: cel });
  const clave = L.claveSolicitud(c.id, p.servicio_id, e.iso), ex = s.solicitudPorClave(clave);
  await sleep(LAT_MS);
  if (!ex) s.crearSolicitud({ id_contacto: c.id, clave, utm_campaign: p.utm_campaign }); else s.sumarDuplicado(clave);
};

(async () => {
  const a = await correr("Con bloqueo (Sheet)", conBloqueo);
  const b = await correr("Ingenuo (sin bloqueo)", ingenuo);
  const f = (x, n = 1) => x.toFixed(n);
  const ok = a.contactos === contactosVerdad && a.solicitudes === pares.size;
  const lineas = [
    `# Simulacro de leads (${new Date().toISOString().slice(0, 10)})`, "",
    `Bots concurrentes: **${CONCURRENCIA}** · envíos totales: **${eventos.length}** (${nValidos} válidos + ${eventos.length - nValidos} inválidos) · personas: **${PERSONAS}** · semilla: ${SEED} · escritura simulada: ${LAT_MS} ms`, "",
    `Verdad de referencia: **${contactosVerdad} contactos únicos** y **${pares.size} solicitudes únicas** (persona + servicio + día).`, "",
    "| Procesador | Contactos | Solicitudes | Duplicados bloqueados | Contactos de más | Solicitudes de más | Envíos/s | p50 (ms) | p95 (ms) |", "|---|---|---|---|---|---|---|---|---|",
    ...[a, b].map((r) => `| ${r.nombre} | ${r.contactos} | ${r.solicitudes} | ${r.duplicadosBloqueados} | ${r.contactos - contactosVerdad} | ${r.solicitudes - pares.size} | ${f(r.rps, 0)} | ${f(r.p50)} | ${f(r.p95)} |`), "",
    `Resultado: ${ok ? "**CORRECTO**: con bloqueo, 0 duplicados y todos los datos coinciden con la verdad." : "**FALLA**: hay diferencias con la verdad."}`,
    `Registro del procesador con bloqueo: ${JSON.stringify(a.log)}.`, "",
    "## Qué prueba y qué no",
    "- Prueba la lógica anti-duplicados (normalización, idempotencia, clave por persona + servicio + día) y por qué hace falta un bloqueo: sin él, bajo concurrencia aparecen contactos y solicitudes repetidos.",
    "- **No mide la capacidad real** de Google Sheets, de Apps Script ni del hosting. El tiempo de escritura es simulado. La capacidad real se mide con una prueba de carga contra el sistema desplegado.",
  ];
  const md = lineas.join("\n");
  console.log(md);
  if (process.argv.includes("--md")) fs.writeFileSync(__dirname + "/../../docs/simulacro-leads.md", md + "\n");
  process.exitCode = ok ? 0 : 1;
})();
