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
- Simulación del enlace de Instagram (artefacto aparte): `python3 scripts/simulacion-ig/construir.py` (requiere `.enlace/` ya construido con `scripts/enlace/build.sh`); se republica tras cambios en `/ig`.
- Servidor: `server/` (pagos, seguridad, leads; TypeScript ejecutable por Node) y `functions/` (Cloudflare Pages Functions). Pruebas: `npm test`. Tipos: `npm run typecheck`. CSP: `npm run build:cf` y `node scripts/probar-csp.mjs`. Migración: `supabase/migrations/`. Guía de claves: `docs/pagos-seguridad.md`. NUNCA poner secretos en el código ni en variables `NEXT_PUBLIC_*`.

## Despliegue y operación (actual)
- Producción: Cloudflare Workers `three3-web` (dominio `www.three3agency.com`), rama `three3-web-carga`, raíz `THREE3-web`, build `npm run build:cf`, deploy `npx wrangler deploy` (usa `wrangler.jsonc` + `worker/index.ts`; `/api/*` lo atiende el Worker, el resto sale de `out/`).
- Variables no secretas van en `wrangler.jsonc` (`vars`); los secretos SOLO en el panel de Cloudflare (Settings → Runtime variables and secrets). Variables `NEXT_PUBLIC_*` van en Settings → Builds.
- Base de datos: Supabase `three3-web` (migraciones en `supabase/migrations/`, se ejecutan a mano en el SQL Editor). Llave nueva `sb_secret_…` solo en cabecera `apikey` (`server/pagos/cabeceras-supabase.ts`).
- WhatsApp de contacto: `src/config/empresa.config.json` (campo `whatsapp`). Bot de Meta: `docs/bot-meta.md` (apagado hasta `BOT_ACTIVO=si`).
- `.gitignore` raíz usa `/lib/` (no `lib/`): `src/lib/` DEBE estar versionado.
- Pagos: Mercado Pago solo en modo prueba salvo `MP_MODO=produccion` y `MP_PRODUCCION_APROBADA=si`.
- Pendientes y decisiones del dueño: `PENDIENTES.md` en la raíz del repo.
