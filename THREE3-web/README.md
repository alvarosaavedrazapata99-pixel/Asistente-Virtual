# THREE3-web

Web de THREE3 (bots con IA para negocios). Next.js 16 (export estático) + Cloudflare Pages Functions + Supabase + Mercado Pago (solo modo prueba).

## Comandos
- `npm run dev` · `npm run build` · `npm run build:cf` (genera `out/` con CSP por hash)
- `npm run typecheck` · `npm run lint` · `npm test`
- `node scripts/probar-csp.mjs` (comprueba CSP en Chromium real)

## Configuración
- Planes y precios (soles, "desde"): `src/config/planes.config.json`
- Datos de empresa y número de WhatsApp: `src/config/empresa.config.json` (mientras `whatsapp` esté vacío, "Agendar diagnóstico" abre el formulario)
- Pagos: `docs/pagos-seguridad.md`. Producción solo con `MP_MODO=produccion` **y** `MP_PRODUCCION_APROBADA=si`.
- Secretos: solo como secretos de Cloudflare; nunca en el código ni en `NEXT_PUBLIC_*`.

Más: `CLAUDE.md`, `docs/`, `PENDIENTES.md` (en la raíz del repo).
