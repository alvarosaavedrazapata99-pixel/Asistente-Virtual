/* Versión ligera: todas las interacciones de la web ya están escritas en JavaScript simple (public/*.js y scripts/enlace/site.js),
   así que se quitan los scripts de hidratación de Next (~190 KB comprimidos) y se enlazan solo los scripts simples de cada página.
   Se ejecuta después de `next build` y antes de `csp.mjs`. LIGERO=0 la desactiva. */
import { copyFileSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

if (process.env.LIGERO === "0") { console.log("ligero: desactivado (LIGERO=0)"); process.exit(0); }
const salida = new URL("../out/", import.meta.url).pathname;
copyFileSync(new URL("./enlace/site.js", import.meta.url), join(salida, "site.js"));

const INICIO = [{ src: "/site.js" }, { src: "/activar.js" }, { src: "/ui.js" }, { src: "/demo.js" }, { src: "/widget.js", attrs: 'data-cliente="three3"' }];
const porPagina = (ruta) => {
  if (ruta === "index.html") return INICIO;
  if (ruta === "ig.html" || ruta.startsWith("ig/")) return [{ src: "/eventos.js" }];
  if (ruta === "pagar.html" || ruta.startsWith("pagar/")) return [{ src: "/pagar.js" }];
  if (ruta === "diagnostico.html") return [{ src: "/diagnostico-core.js" }, { src: "/diagnostico.js" }];
  if (ruta.startsWith("mas/")) return [{ src: "/mas.js" }];
  if (ruta === "presentacion.html") return [{ src: "/presentacion.js" }];
  if (ruta === "admin.html") return [{ src: "/admin.js" }, { src: "/admin-clientes.js" }, { src: "/costos-core.js" }, { src: "/admin-extra.js" }];
  return [];
};

const paginas = [];
(function recorrer(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!n.startsWith("_next")) recorrer(p); } else if (n.endsWith(".html")) paginas.push(p);
  }
})(salida);

let antes = 0, despues = 0;
for (const p of paginas) {
  let h = readFileSync(p, "utf8");
  antes += h.length;
  const turnstile = h.includes("cf-turnstile");
  h = h.replace(/<script\b[\s\S]*?<\/script>/g, "");
  h = h.replace(/<link\b(?=[^>]*\brel="(?:preload|modulepreload)")(?=[^>]*\bas="script"|[^>]*\brel="modulepreload")[^>]*>/g, "");
  const tags = porPagina(relative(salida, p));
  if (turnstile) tags.push({ src: "https://challenges.cloudflare.com/turnstile/v0/api.js", extra: "async" });
  const html = tags.map((t) => `<script src="${t.src}" ${t.attrs ?? ""} ${t.extra ?? "defer"}></script>`.replace(/\s+>/, ">")).join("");
  h = h.includes("</body>") ? h.replace("</body>", `${html}</body>`) : h + html;
  despues += h.length;
  writeFileSync(p, h);
}
console.log(`ligero: ${paginas.length} páginas sin hidratación de Next (${Math.round((antes - despues) / 1024)} KB menos de HTML)`);
