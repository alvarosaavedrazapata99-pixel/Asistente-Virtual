# ADR 0004: Videos: WebM estándar + MP4 + pósters

- **Estado:** Aceptado
- **Fecha:** 2026-10-31

## Contexto
Los 9 WebM del paquete estaban codificados en VP9 con formato de color `gbrp` (RGB), poco soportado: Chromium mostró bloques dañados y Safari/hardware pueden no reproducirlos.

## Decisión
Recodificar todos los WebM desde los MP4 a VP9 `yuv420p`. Servir WebM primero y MP4 de respaldo, con póster por video (primer cuadro, WebP), `preload=none`, reproducción solo al estar visible y póster fijo con prefers-reduced-motion.

## Consecuencias
+ Archivos 40–60%% más livianos (hero 562→208 KB). + Compatibilidad real. − Si el paquete trae nuevos WebM, hay que recodificarlos (comando en CLAUDE.md).
