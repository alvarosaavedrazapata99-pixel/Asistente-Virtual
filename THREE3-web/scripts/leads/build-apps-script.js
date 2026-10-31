/* Genera docs/sheets/Codigo.gs = núcleo probado (core.js) + adaptador del Sheet. */
const fs = require("fs"), path = require("path");
const core = fs.readFileSync(path.join(__dirname, "core.js"), "utf8");
const adapt = fs.readFileSync(path.join(__dirname, "adaptador-sheet.gs.js"), "utf8");
const out = "/* GENERADO por scripts/leads/build-apps-script.js. No editar a mano. */\n" + core + adapt;
fs.writeFileSync(path.join(__dirname, "../../docs/sheets/Codigo.gs"), out);
console.log("docs/sheets/Codigo.gs", out.split("\n").length, "líneas");
