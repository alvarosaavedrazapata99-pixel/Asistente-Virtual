# Fase 1 — verificación (31-oct-2026)

Web construida como port fiel de `boceto_inicio.html` (30-oct): mismo diseño, textos, 8 videos y 3 imágenes de Tri.
Páginas: `/` y `/legal` (port de `legal.html`, texto estático). Build y lint sin errores.

| Prueba | Móvil | Escritorio |
|---|---|---|
| Lighthouse rendimiento | 92–94 | 100 |
| Accesibilidad / buenas prácticas / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| LCP (simulación Lighthouse) | 3,0 s (meta: 2,5 s, **no cumplida**) | 0,6 s |
| CLS | 0 | 0 |
| Scroll horizontal (Playwright 390 px y 1440 px) | no | no |
| Videos de servicios reproduciéndose al ser visibles | 6 de 6 | 6 de 6 |
| Panel "Ver precio / Cerrar" | funciona | funciona |

Pendiente: LCP móvil (elemento: imagen de Tri; el resto de subpartes suma <300 ms, la diferencia viene de la simulación de red lenta).
Los precios son los "de ejemplo" del boceto; con `publicar:false` la tarjeta muestra "Cotizar".
Videos: solo MP4 (el boceto no trae WebM). Sin `hero_loop` ni WebM todavía.
Capturas en `docs/capturas/`.
