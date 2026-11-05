/* Produce los videos de las secciones de la web. Cada escena (scripts/video/escenas/*.html) es una animación CSS en bucle de 12 s;
   se fotografía cuadro por cuadro con el navegador (posicionando la línea de tiempo con la API de animaciones), así el bucle es perfecto
   y la calidad no depende de una grabación de pantalla. Requiere `npm run build:cf` antes (fuentes e imágenes salen de out/).
   Uso: node scripts/video/grabar.mjs [id ...]   (sin ids, graba todos) */
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");

const RAIZ = new URL("../../", import.meta.url).pathname;
const OUT = join(RAIZ, "out"), ESC = join(RAIZ, "scripts/video/escenas"), VID = join(RAIZ, "public/videos"), POS = join(VID, "posters");
mkdirSync(POS, { recursive: true });
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["despues", "proceso", "planes", "personaje", "instagram"];
const FPS = 30, DUR = 12, PRE = 30; // PRE: segundos de «calentamiento» para estar ya en régimen periódico (hay retrasos de hasta 10 s)

const css = readdirSync(join(OUT, "_next/static/chunks")).filter((f) => f.endsWith(".css")).map((f) => readFileSync(join(OUT, "_next/static/chunks", f), "utf8")).join("\n");
const FUENTES = [...css.matchAll(/@font-face\{[^}]*\}/g)].map((m) => m[0].replace(/url\(\.\.\/media\//g, "url(/_next/static/media/")).filter((r) => /font-family:(Michroma|Inter)\b/.test(r)).join("\n");
const BASE = readFileSync(join(ESC, "_base.css"), "utf8");
const tipos = { ".webp": "image/webp", ".woff2": "font/woff2", ".css": "text/css", ".js": "text/javascript" };
const srv = createServer((q, r) => {
  const u = decodeURIComponent(new URL(q.url, "http://x").pathname);
  if (u.startsWith("/escena/")) { const f = join(ESC, u.slice(8) + ".html"); if (!existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": "text/html" }); return r.end(readFileSync(f, "utf8").replace("{{FUENTES}}", FUENTES).replace("{{BASE}}", BASE)); }
  const f = join(OUT, u); if (!existsSync(f) || !statSync(f).isFile()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": tipos[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f));
});
await new Promise((ok) => srv.listen(3990, ok));
const nav = await chromium.launch();

const ff = (args, entrada) => new Promise((ok, fallo) => { const p = spawn("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["pipe", "inherit", "inherit"] }); p.on("close", (c) => (c ? fallo(new Error("ffmpeg " + c)) : ok())); if (entrada) entrada(p.stdin); });

for (const id of ids) {
  const pag = await (await nav.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, reducedMotion: "no-preference" })).newPage();
  await pag.goto(`http://localhost:3990/escena/${id}`, { waitUntil: "networkidle" });
  await pag.evaluate(() => document.fonts.ready);
  const maestro = join(VID, `_tmp_${id}.mp4`);
  await ff(["-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-crf", "12", "-preset", "medium", "-pix_fmt", "yuv420p", maestro], async (stdin) => {
    for (let k = 0; k < FPS * DUR; k++) {
      const t = (PRE + k / FPS) * 1000;
      await pag.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), t);
      stdin.write(await pag.screenshot({ type: "png" }));
    }
    stdin.end();
  });
  const base = join(VID, `sec_${id}`);
  const vf = "scale=1280:720:flags=lanczos,unsharp=3:3:0.4";
  await ff(["-i", maestro, "-vf", vf, "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", `${base}.mp4`]);
  await ff(["-i", maestro, "-vf", vf, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-pix_fmt", "yuv420p", "-an", `${base}.webm`]);
  await ff(["-i", maestro, "-vf", "scale=640:-2:flags=lanczos", "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", `${base}_sm.mp4`]);
  await ff(["-i", maestro, "-vf", "scale=640:-2:flags=lanczos", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-pix_fmt", "yuv420p", "-an", `${base}_sm.webm`]);
  await ff(["-ss", "4", "-i", maestro, "-frames:v", "1", "-vf", "scale=960:-2", "-c:v", "libwebp", "-quality", "82", join(POS, `sec_${id}.webp`)]);
  spawnSync("rm", ["-f", maestro]);
  console.log("listo", id);
  await pag.context().close();
}
await nav.close(); srv.close();
