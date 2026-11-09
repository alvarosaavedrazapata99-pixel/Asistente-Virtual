/* Genera docs/base-conocimiento.md a partir de conocimiento.config.json + planes.config.json (mismo contenido que lee el bot).
   Uso: node scripts/conocimiento-md.mjs */
import { readFileSync, writeFileSync } from "node:fs";
const leer = (f) => JSON.parse(readFileSync(new URL(`../src/config/${f}`, import.meta.url), "utf8"));
const k = leer("conocimiento.config.json"), p = leer("planes.config.json"), e = leer("empresa.config.json");
const soles = (n) => `S/ ${n.toLocaleString("en-US")}`;
const lista = (t, a) => (a?.length ? `\n## ${t}\n${a.map((x) => `- ${x}`).join("\n")}\n` : "");
const md = [
  "# THREE3 — Base de conocimiento",
  "",
  "> Documento de reglas e información para atender consultas nuevas. Se genera con `node scripts/conocimiento-md.mjs` desde `src/config/conocimiento.config.json` y `planes.config.json`. El bot lee esos mismos archivos.",
  lista("Sobre THREE3", k.sobre_nosotros),
  `\n## Contacto\n- Correo: ${e.correo}\n- WhatsApp: +${e.whatsapp}\n- Instagram: @three_3agency\n- Web: https://www.three3agency.com\n`,
  `\n## Planes y precios (en soles, «desde»)\n${p.planes.map((x) => `### ${x.modulo ? x.nombre : `Plan ${x.nombre}`} — desde ${soles(x.inicial)} + ${soles(x.mensual)} al mes\n${x.resumen}\n${x.para ? `\n**Ideal para:** ${x.para}\n` : ""}${x.incluye ? `\n${x.incluye.map((i) => `- ${i}`).join("\n")}\n` : ""}${x.nota ? `\n_${x.nota}_\n` : ""}`).join("\n")}`,
  `\n## La mensualidad incluye\n${(p.mensualidad_detalle ?? []).map((m) => `- **${m.t}:** ${m.d}`).join("\n")}\n\n${p.aclaracion}\n`,
  lista("Cómo funciona el bot", k.como_funciona), lista("Canales", k.canales), lista("CRM y reportes", k.crm_y_reportes),
  lista("Costos y pagos aparte", k.pagos_y_costos_aparte), lista("Demo", k.demo),
  k.faq?.length ? `\n## Preguntas frecuentes\n${k.faq.map((f) => `**${f.p}**  \n${f.r}\n`).join("\n")}` : "",
  lista("Cómo conversar", k.reglas_de_conversacion), lista("Nunca", k.nunca),
].join("\n").replace(/\n{3,}/g, "\n\n");
writeFileSync(new URL("../docs/base-conocimiento.md", import.meta.url), md.trim() + "\n");
console.log("docs/base-conocimiento.md generado:", md.split("\n").length, "líneas");
