# ADR 0005: Hero con el video oficial como fondo

- **Estado:** Aceptado
- **Fecha:** 2026-10-31

## Contexto
`hero_loop` es una escena completa (Tri, chips, circuitos) con espacio libre a la izquierda para el texto.

## Decisión
Usar `hero_loop` como fondo del hero (escritorio) y como bloque bajo el texto (móvil). Se retiran el canvas de circuitos y el Tri con anillos duplicados.

## Consecuencias
+ Menos JavaScript y un hero idéntico al diseño aprobado. − El texto del hero compite con el video si se cambia el video (mantener la zona izquierda libre).
