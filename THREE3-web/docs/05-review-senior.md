# Revisión técnica senior de THREE3-web (31-oct-2026)

> Aclaración: no es la opinión de una persona real. Es una revisión escrita con la mirada de un ingeniero de sistemas full stack senior, basada en datos medidos del proyecto. Antes de lanzar con dinero o datos reales, una revisión de seguridad y legal por humanos sigue siendo necesaria.

## Veredicto
Muy buena base visual y de producto para un MVP de captación; **todavía no es una plataforma de compra "full stack"**: hoy es una web estática con un formulario que escribe en un Google Sheet. Está lista para un lanzamiento pequeño y controlado, no para tráfico pagado ni para cobrar.

## Lo que elogiaría
1. **Diseño y UX móvil cuidados** (Lighthouse 100/100/100 en escritorio; menú, filtros, botón fijo, accesibilidad por teclado).
2. **Anti-duplicados bien pensado y probado**: núcleo único, 17 pruebas unitarias y simulacro con 200 bots (0 duplicados con bloqueo, 119+82 sin él).
3. **Degradación elegante**: si falla el envío, el formulario cae a "copiar y enviar por Instagram"; con movimiento reducido hay imagen fija y botón ▶.
4. **Decisiones documentadas** (10 ADR), precios en un solo archivo, datos de la empresa en otro: se cambia sin tocar código.
5. **Honestidad del contenido**: sin testimonios ni cifras inventadas; textos legales marcados como borrador.

## Lo que criticaría (de más a menos grave)
| # | Crítica | Evidencia | Qué hacer |
|---|---|---|---|
| 1 | **Promesas en el hero que hoy no son ciertas**: "servicios en 1 clic" y "PEN · USD pago local" cuando no hay pagos; "24/7 funcionando" no está respaldado | `src/app/page.tsx`, bloque de cifras | Cambiar el copy hasta que existan pagos (riesgo de reclamo del consumidor) |
| 2 | **Endpoint público sin protección real**: Apps Script abierto; solo hay un campo trampa y una etiqueta simple | `scripts/leads/adaptador-sheet.gs.js` | Turnstile + límite de frecuencia por un servidor propio (ruta de Next en Cloudflare/Supabase) antes de publicidad |
| 3 | **Google Sheets/Apps Script como base de datos**: lee la hoja completa en cada escritura (O(n)), una escritura a la vez, cuotas de Google | Documentado en `docs/sheets/README.md` | Postgres con índices únicos (ADR 0008) cuando haya tráfico; el Sheet queda como vista |
| 4 | **Sin cabeceras de seguridad ni CSP** (ni `_headers`) y sin robots/sitemap/OG/JSON-LD | `out/` no contiene `_headers`, `robots.txt`, `sitemap.xml`; 0 `og:image`, 0 JSON-LD | Agregar `_headers` (CSP, HSTS, frame-ancestors, Referrer/Permissions-Policy) y SEO básico al lanzar |
| 5 | **Presupuesto de rendimiento incumplido**: 185 KB de JS comprimido en la home (meta v4: 170 KB) y LCP móvil de ~3,0 s | Medido en el build | Reducir hidratación de React en bloques estáticos (islas), precarga del póster del hero |
| 6 | **Sin CI ni pruebas automáticas** de la web (solo las del núcleo de leads) | No existe `.github/` ni `tests/` | GitHub Actions: lint, tipos, build, pruebas del núcleo, Playwright, Lighthouse CI, gitleaks |
| 7 | **Deuda por doble implementación**: el enlace de revisión usa JS simple que repite lógica de componentes React; `site.js` se desincroniza | `scripts/enlace/site.js` | Es solo para revisión; al publicar en el hosting real se usa el proyecto Next y se retira |
| 8 | **El teléfono solo acepta celulares peruanos de 9 dígitos**: un cliente extranjero o con fijo es rechazado | `normCel` en `scripts/leads/core.js` | Aceptar formato internacional (E.164) y mantener la regla peruana como caso común |
| 9 | **El mismo cliente con correo en un envío y celular en otro** queda como dos contactos | Limitación documentada | Pedir ambos datos, o fusionar contactos al detectar coincidencia |
| 10 | **Datos personales en un Sheet de Google** sin política de retención, sin acceso restringido definido, sin registro de banco de datos | `/legal` con [COMPLETAR] | Definir quién accede, plazo de borrado, y evaluar inscripción (Ley 29733) con abogado |
| 11 | **Static export limita el futuro**: pagos, webhooks y panel necesitan servidor | `next.config.ts` con `output: "export"` | Al llegar a pagos, quitar `export` y desplegar con funciones (Cloudflare/Vercel) según ADR 0002 |
| 12 | **Sin monitoreo ni alertas** (formulario caído, Apps Script con error) | — | Monitor de disponibilidad gratis + aviso por correo si el envío falla |

## Qué te recomendaría hacer, en orden
1. Corregir las promesas del hero (crítica 1). Es gratis y de riesgo legal.
2. Publicar en Cloudflare Pages con `_headers` de seguridad y `noindex` hasta el lanzamiento.
3. Mover el formulario detrás de una ruta propia con Turnstile y límite de frecuencia (crítica 2).
4. Pasar los leads a Postgres con índices únicos y dejar el Sheet como espejo (crítica 3).
5. Montar CI con presupuesto de rendimiento y pruebas (críticas 5 y 6).
6. Llenar `/legal` con datos reales y pasar por abogado y contador (crítica 10).

## Qué integrar sin ensuciar el diseño (en orden de valor)
| Integración | Por qué | Costo |
|---|---|---|
| Botón flotante de WhatsApp | Es el canal que más usa tu público; se activa al poner el número en `empresa.config.json` | US$ 0 |
| Analítica sin cookies (Plausible, Umami o similar) | Mide visitas y embudo sin banner pesado de cookies **[VALIDAR el plan de cada una]** | Desde US$ 0 si se aloja uno mismo |
| Imagen para compartir (Open Graph) y datos estructurados | Que el enlace se vea bien en mensajes y en Google; Preguntas frecuentes con JSON-LD | US$ 0 |
| Cloudflare Turnstile en el formulario | Frena bots sin pedir "elige los semáforos" | US$ 0 |
| Casos reales (cuando existan) | Prueba social solo real; hoy el sitio no tiene ninguna, y está bien | — |
| Reserva de llamada (Cal.com o similar) | Convierte mejor que un formulario para servicios caros | Plan gratis **[VALIDAR]** |
| Blog o novedades desde tu grilla de Instagram | Reutiliza tus 42 carruseles como contenido y SEO | US$ 0 |

## Lo que podrían criticar desde afuera
- **Un cliente exigente:** "¿dónde veo precios?". La respuesta honesta es cotizar; conviene mostrar al menos un rango o un "desde" cuando haya cotizaciones validadas.
- **Un competidor:** "los videos son animaciones, no demos reales del producto". Cuando haya casos, reemplazar por capturas reales.
- **Un abogado:** textos con [COMPLETAR], consentimiento de datos, Libro de Reclamaciones, uso de IA y la frase de medición anónima.
- **Un técnico:** que el formulario dependa de Apps Script y que el enlace de revisión no sea el producto real.
