# Auditoría UX/UI y mejoras (31-oct-2026)

Método: pruebas en iPhone 13 simulado (390 px, táctil) y laptop (1440 px), con Playwright y capturas en `docs/capturas/`. Nota: el teléfono simulado necesita la etiqueta `viewport`; sin ella dibuja la versión de escritorio (corregido en el script del enlace).

## Problemas encontrados → solución
| # | Problema (móvil salvo indicación) | Solución |
|---|---|---|
| 1 | Sin menú: solo logo y un botón; imposible saltar de sección | Menú hamburguesa que flota sobre la página, cierra con Esc, al tocar fuera o al elegir un enlace |
| 2 | Video de Tri debajo de todo el texto | Orden en móvil: titular → botones → video con Tri → cifras. Tri ya asoma en la primera pantalla |
| 3 | Las 3 cifras se rompían (la tercera sola) | Cuadrícula de 3 columnas con tipografía ajustada |
| 4 | Botones de 16–43 px de alto (mínimo cómodo: 44 px) | Todos los botones, chips y cierre ≥ 44 px (quedan solo enlaces dentro de párrafos) |
| 5 | 8 tarjetas en una columna: 12.700 px de scroll | Filtros "Todos / Automatización / Creativos" que anuncian cuántos servicios se muestran |
| 6 | Al saltar a una sección, la barra fija tapaba el título | `scroll-padding-top` |
| 7 | Sin pista de en qué sección estás (laptop y móvil) | La sección activa se subraya en la barra y el menú |
| 8 | Sin llamada a la acción visible mientras se recorre la página | Botón fijo "Activar un servicio" en móvil: aparece al salir del hero y se oculta en el cierre |
| 9 | Formulario en móvil: ventana pequeña flotante y teclado que saltaba al abrir | Hoja inferior a todo el ancho; no se enfoca el primer campo en pantallas táctiles |
| 10 | Con "reducir movimiento" todo quedaba inmóvil | Botón ▶ en cada video para reproducirlo a voluntad |

## Resultado de pruebas
- Menú abre/cierra (botón, Esc, enlace); el contenido no se desplaza al abrirlo (0 px).
- Título de sección visible tras saltar desde el menú. Filtro "Creativos" muestra 3 de 8 y "Todos" vuelve a 8.
- Botón fijo: oculto arriba, visible en el recorrido, oculto en el cierre. Sin scroll horizontal ni errores en consola.
- Laptop: sin hamburguesa ni botón fijo; sección activa resaltada.

## Pendiente (orden de impacto)
1. Páginas por servicio (`/servicios/[slug]`) con "qué incluye / qué necesitamos / FAQ" y enlace directo para compartir por Instagram.
2. Mover el LCP móvil de 3,0 s a < 2,5 s (imagen del hero más liviana y precarga).
3. Pruebas con 5 personas reales en celular (grabar dónde dudan).
4. WhatsApp flotante cuando exista el número.
5. Estados de carga/error del formulario cuando haya servidor.
