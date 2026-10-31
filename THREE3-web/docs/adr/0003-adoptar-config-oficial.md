# ADR 0003: Adoptar el services.config.json oficial de 8 servicios

- **Estado:** Aceptado (opción 3 elegida por ti)
- **Fecha:** 2026-10-31

## Contexto
El sitio usaba 6 servicios copiados del boceto. El paquete trae el archivo oficial con 8 servicios, tipo de cambio 3.4, mensualidades y plazos.

## Decisión
El archivo oficial es la fuente única de precios, plazos y mensualidad (`src/config/services.config.json`). Los textos, "incluye" y videos viven en `src/lib/services.ts`. USD se calcula como PEN / tipo_cambio_usd. Orden del catálogo = orden del archivo.

## Consecuencias
+ Pack y personaje básico/completo ya visibles. + Un solo lugar para cambiar precios. − Si se agrega un servicio al archivo, hay que agregar su presentación o el build falla (a propósito).
