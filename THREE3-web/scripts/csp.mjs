/* Genera out/_headers para Cloudflare Pages: cabeceras de seguridad y una CSP por página con el hash de cada script en línea.
   Así no hace falta 'unsafe-inline' en los scripts. Se ejecuta después de `next build`. */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const salida = new URL("../out/", import.meta.url).pathname;
const paginas = [];
(function recorrer(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!n.startsWith("_next")) recorrer(p); } else if (n.endsWith(".html") && n !== "404.html" && !n.startsWith("_")) paginas.push(p);
  }
})(salida);

const extra = [];
for (const v of [process.env.NEXT_PUBLIC_LEADS_ENDPOINT]) { try { const u = new URL(v ?? ""); if (u.protocol === "https:") extra.push(u.origin); } catch {} }
const conexion = ["'self'", "https://challenges.cloudflare.com", ...new Set(extra)].join(" ");

const hashes = (html) => [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`);
const csp = (h) => [
  "default-src 'self'",
  `script-src 'self' ${[...new Set(h)].join(" ")} https://challenges.cloudflare.com`.replace(/\s+/g, " "),
  "style-src 'self'", "style-src-attr 'unsafe-inline'",
  "img-src 'self' data:", "media-src 'self'", "font-src 'self'",
  `connect-src ${conexion}`, "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'", "object-src 'none'", "upgrade-insecure-requests",
].join("; ");

let t = `/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/videos/*
  Cache-Control: public, max-age=604800

/assets/*
  Cache-Control: public, max-age=604800

/pagar*
  Referrer-Policy: no-referrer
  Cache-Control: no-store
`;
for (const p of paginas) {
  const rel = "/" + relative(salida, p).replace(/\\/g, "/").replace(/\.html$/, "");
  const ruta = rel === "/index" ? "/" : rel;
  const regla = `\n${ruta}\n  Content-Security-Policy: ${csp(hashes(readFileSync(p, "utf8")))}\n`;
  t += regla;
  if (ruta === "/") t += `\n/index.html\n  Content-Security-Policy: ${csp(hashes(readFileSync(p, "utf8")))}\n`;
}
writeFileSync(join(salida, "_headers"), t);
console.log(`_headers: ${paginas.length} páginas con CSP por hash`);
