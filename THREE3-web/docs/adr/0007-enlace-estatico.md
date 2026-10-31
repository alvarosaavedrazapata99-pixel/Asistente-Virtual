# ADR 0007: Enlace de revisión estático republicado tras cada cambio

- **Estado:** Aceptado
- **Fecha:** 2026-10-31

## Contexto
La versión React con rutas reescritas no se hidrataba bajo un subdirectorio del enlace.

## Decisión
Publicar el HTML/CSS exportado por Next más `scripts/enlace/site.js` y `public/activar.js` (JS simple). Reconstruir y republicar el mismo enlace tras cada cambio visible.

## Consecuencias
+ Siempre puedes ver el último avance. − Las interacciones nuevas hay que replicarlas en JS simple; el producto real es el proyecto Next.
