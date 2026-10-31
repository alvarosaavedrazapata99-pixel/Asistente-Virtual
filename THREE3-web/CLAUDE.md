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
