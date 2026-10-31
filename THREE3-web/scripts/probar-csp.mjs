/* Sirve out/ aplicando _headers como Cloudflare y comprueba en un navegador real que no haya violaciones de CSP. */
import http from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { createRequire } from "node:module";
const { chromium, devices } = createRequire(import.meta.url)("playwright");

const raiz = new URL("../out/", import.meta.url).pathname;
const reglas = []; let actual = null;
for (const l of readFileSync(join(raiz, "_headers"), "utf8").split("\n")) {
  if (!l.trim()) continue;
  if (!l.startsWith(" ")) { actual = { patron: l.trim(), cab: {} }; reglas.push(actual); } else { const i = l.indexOf(":"); actual.cab[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
}
const coincide = (patron, ruta) => (patron.endsWith("*") ? ruta.startsWith(patron.slice(0, -1)) : patron === ruta);
const tipos = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".mp4": "video/mp4", ".webm": "video/webm", ".woff2": "font/woff2", ".ico": "image/x-icon", ".json": "application/json", ".txt": "text/plain" };
const srv = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x"); let ruta = decodeURIComponent(url.pathname);
  let archivo = join(raiz, ruta);
  if (!existsSync(archivo) || statSync(archivo).isDirectory()) archivo = existsSync(archivo + ".html") ? archivo + ".html" : join(archivo, "index.html");
  if (!existsSync(archivo)) { res.writeHead(404); return res.end("no"); }
  const cab = { "Content-Type": tipos[extname(archivo)] ?? "application/octet-stream" };
  for (const r of reglas) if (coincide(r.patron, ruta)) Object.assign(cab, r.cab);
  res.writeHead(200, cab); res.end(readFileSync(archivo));
});
await new Promise((r) => srv.listen(3950, r));
const b = await chromium.launch(); let fallos = 0;
for (const [nombre, ctxo] of [["escritorio", { viewport: { width: 1280, height: 900 } }], ["movil", devices["iPhone 13"]]]) {
  for (const ruta of ["/", "/legal", "/ig", "/ig/pack", "/pagar?o=ord_prueba123&t=x"]) {
    const ctx = await b.newContext(ctxo); const p = await ctx.newPage(); const viol = [], errs = [];
    await p.addInitScript(() => { window.__v = []; document.addEventListener("securitypolicyviolation", (e) => window.__v.push(`${e.violatedDirective} ${e.blockedURI}`)); });
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 100)));
    await p.goto("http://localhost:3950" + ruta, { waitUntil: "networkidle" });
    if (ruta === "/") { await p.click("nav .btn"); await p.waitForTimeout(300); await p.keyboard.press("Escape"); await p.evaluate(() => document.querySelector("#servicios").scrollIntoView()); await p.click("#servicios .foot button >> nth=0"); await p.waitForTimeout(400); }
    const v = await p.evaluate(() => window.__v); viol.push(...v);
    const hidratada = ruta === "/" ? await p.evaluate(() => document.querySelectorAll(".card.open").length === 1 && document.getElementById("activar") !== null) : true;
    const csp = await (await p.request.get("http://localhost:3950" + ruta.split("?")[0])).headers()["content-security-policy"];
    const ok = viol.length === 0 && errs.length === 0 && hidratada && !!csp;
    if (!ok) fallos++;
    console.log(`${ok ? "OK " : "FALLA"} ${nombre} ${ruta.padEnd(26)} CSP:${csp ? "sí" : "NO"} violaciones:${viol.length} errores:${errs.length} interactiva:${hidratada}`, viol.length ? viol.slice(0, 3) : "");
    await ctx.close();
  }
}
await b.close(); srv.close(); process.exit(fallos ? 1 : 0);
