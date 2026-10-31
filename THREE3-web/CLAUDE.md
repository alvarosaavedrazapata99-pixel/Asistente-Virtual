# THREE3-web — reglas de trabajo

**Enlace de revisión (artifact):** https://claude.ai/artifact/CLQScQh66UhvBtLBY34uXj

Después de CADA cambio visible en el código (componentes, estilos, textos, config de servicios, assets):
1. `scripts/enlace/build.sh` (reconstruye `.enlace/`).
2. Republicar con la herramienta Artifact el MISMO enlace: `url` = el de arriba, `file_path` = `.enlace/index.html`, `root` = `.enlace`,
   `files` = `legal.html`, `assets/*`, `videos/*` (no pasar `icon`).
3. Probar antes en local (Playwright, móvil y escritorio) y avisar al usuario qué cambió.

Notas:
- El enlace usa el HTML/CSS exportado de Next + `scripts/enlace/site.js` (JS simple). Si se agrega una interacción nueva en un componente React, hay que replicarla en `site.js`.
- Con `output: "export"` no se puede usar `cacheComponents`/PPR.
- Tri siempre con antena de 3 bolitas. Precios de ejemplo: `src/config/services.config.json` (`publicar:false` => "Cotizar").
- Decisiones: `docs/decisiones.md` (ADRs en `docs/adr/`). Videos: WebM siempre `yuv420p` (los del paquete venían en `gbrp`);
  recodificar con `ffmpeg -i x.mp4 -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 0 -crf 34 -an x.webm`.
- Al publicar, pasar en `files` todo el contenido de `.enlace/` (legal.html, assets/, videos/ incl. videos/posters/).
- Leads: lógica anti-duplicados en `scripts/leads/core.js` (probar con `node scripts/leads/prueba-unitaria.js`); `docs/sheets/Codigo.gs` se genera con `node scripts/leads/build-apps-script.js`. Si cambias `core.js`, regenera y vuelve a pegar el script.
- El formulario envía solo si existe `NEXT_PUBLIC_LEADS_ENDPOINT` (si no, modo copiar y enviar).
