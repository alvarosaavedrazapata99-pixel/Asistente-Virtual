# Decisiones y recomendaciones (31-oct-2026)

| ADR | Decisión | Estado |
|---|---|---|
| [0001](adr/0001-cotizar-primero.md) | Validar precios con "Cotizar" antes de activar pagos | **Propuesto** (necesita tu OK) |
| [0002](adr/0002-arquitectura-a.md) | Arquitectura A (Next.js + Supabase + Inngest + worker; Cloudflare en el borde) | **Propuesto** (necesita tu OK) |
| [0003](adr/0003-adoptar-config-oficial.md) | Adoptar el `services.config.json` oficial de 8 servicios | Aceptado (tu opción 3) |
| [0004](adr/0004-videos-webm-estandar.md) | WebM recodificado a `yuv420p` + MP4 + pósters | Aceptado |
| [0005](adr/0005-hero-video-oficial.md) | Hero con `hero_loop` como fondo | Aceptado |
| [0006](adr/0006-formulario-interino.md) | Formulario Activar sin servidor (interino) | Aceptado como interino |
| [0007](adr/0007-enlace-estatico.md) | Enlace de revisión estático, republicado tras cada cambio | Aceptado |
| [0008](adr/0008-leads-sheet-interino.md) | Sheet maestro = vista de trabajo; base de datos real en Postgres cuando haya tráfico | **Propuesto** (necesita tu OK) |
| [0009](adr/0009-dominio.md) | Dominio: three3agency.com (+ three3.pe); three3.com está ocupado | **Propuesto** (la compra es tuya) |

## Recomendaciones abiertas
1. **Qué NO construir todavía:** pagos y facturación SUNAT (antes de validar precios), sandbox de juegos y render automático de Blender (primero a mano con plantilla), A/B, multi-idioma, panel de analítica propio.
2. **Producir el .blend de Tri y confirmar la antena de 3 bolitas** antes de cualquier uso 3D (el PNG ya está verificado).
3. **Hacer 3 cotizaciones reales** para sustituir los precios "de ejemplo" (apagar `MOSTRAR_PRECIO_EJEMPLO` en `src/lib/services.ts`).
4. **Contratar revisión de abogado y contador** de `/legal` antes de publicar; sin ella no se lanza.
5. **Crear cuentas** de Supabase, Vercel y Cloudflare y comprar el dominio (.com y .pe).
6. **Abrir PR** de `three3-web-carga` a `main` cuando apruebes la Fase 1.
7. **Problemas conocidos:** LCP móvil de 3,0 s en la simulación de Lighthouse (meta 2,5 s); sin CI ni Lighthouse CI todavía; sitio aún no es monorepo.
