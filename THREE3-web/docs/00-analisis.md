# THREE3 — Fase 0 (v4): análisis y arquitectura

> Método: los skills "Legends" no existen en esta sesión; el análisis usa criterio propio de marketing, ventas, diseño, AppSec, datos y legal-tech. Lo marcado **[VALIDAR]** es hipótesis sin dato verificado. No se inventan competidores, cifras ni testimonios.

## 1. Público objetivo
| Segmento | Dolor | Canal | Prioridad |
|---|---|---|---|
| **A. Pyme peruana que vende por WhatsApp/Instagram** (clínicas, tiendas, academias, inmobiliarias) | Responde tarde, pierde leads, anota en cuaderno o Excel | Instagram, comentarios con palabra clave | **1** |
| B. Marca personal / emprendedor | Quiere mascota y presencia premium | Reels, turntables 3D | 2 |
| C. Creador/estudio pequeño | Juego a medida barato | Serie "Crea tu videojuego" | 3 |

El comprador A paga recurrente (mantenimiento mensual) y entiende el retorno. B y C son entrada y diferenciación visual.

## 2. Propuesta de valor por servicio
| Servicio | Promesa concreta | Qué lo hace comprable |
|---|---|---|
| Chatbot web + WhatsApp | Atiende 24/7 con tu información y pasa a una persona cuando hace falta | Precio y plazo visibles; se identifica como asistente virtual |
| CRM | Contactos, ventas y seguimiento en un tablero | Plantilla versionada + checklist de uso |
| Captación de leads | Del comentario/formulario al CRM, con aviso y recordatorios | Prueba de humo automática al entregar |
| Base maestra en Sheets | Datos ordenados y listos para analizar | Es la entrada barata (2–3 días) |
| Pack Chatbot + CRM + Leads | Flujo completo de ventas | Ancla de precio frente a agencias |
| Personaje 3D (básico / completo) | Mascota original con licencia clara | Boceto aprobado antes de modelar |
| Videojuego a medida | Juego web de alcance cerrado | Revisión humana siempre |
| Idiomas/voz | Demo de Tri en varios idiomas | Es demostración, no servicio con precio |

## 3. Competencia (categorías; nombres a validar con búsquedas reales)
- **Constructores no-code de chatbots/CRM por suscripción:** baratos, pero el cliente arma todo solo.
- **Agencias y freelancers locales de automatización:** sin catálogo ni precio público, entrega artesanal. El archivo de precios cita rangos de agencias (flujo completo S/ 8,000–15,000; mantenimiento S/ 500–2,000/mes) **[VALIDAR con 3 cotizaciones]**.
- **Estudios 3D / freelancers de personajes:** buen arte, venta por cotización, sin proceso transparente ni licencia estándar.
- **Brecha:** nadie combina catálogo con precio visible, marca fuerte, entrega con licencia y compra guiada.

## 4. Riesgos
1. **Alcance** (pagos, panel, facturación, sandbox de juegos, Blender automatizado) frente a un equipo pequeño. Mitigación: ver "qué NO construir todavía".
2. **WhatsApp Business** exige verificación de Meta y tiene costos propios: nunca prometer activación instantánea.
3. **Servicios creativos** (personaje, juego) no se automatizan de punta a punta: hay revisión humana y plazos de días. La web debe modelar "en proceso", no "entrega inmediata".
4. **Precios** son hipótesis. Publicar sin validar es el riesgo comercial más barato de evitar.
5. **Legal:** Ley 29733 (datos), 31814 (IA), 32495 (Libro de Reclamaciones), SUNAT. Todo el texto es borrador hasta revisión de abogado y contador.
6. **IA de costo variable:** sin tope por pedido, una conversación larga se come el margen.
7. **Dependencias externas** (Meta, Mercado Pago, Instagram Graph) pueden fallar o cambiar reglas: cada una detrás de una interfaz.

## 5. Qué NO construir todavía
- Cobro automático y facturación SUNAT **antes** de validar precios y demanda con cotizaciones reales (se activa en la Fase 4).
- Sandbox de videojuegos y render automático en Blender: primero se hacen a mano con plantilla; se automatiza lo que se repita 5+ veces.
- Multi-idioma completo, pruebas A/B y panel de analítica propio (basta Plausible/PostHog con consentimiento).
- Marketplace, cuentas de equipo, suscripciones: no hay evidencia de que se necesiten.

## 6. Estado real del proyecto (hoy)
- Hecho: boceto convertido a Next.js (Inicio, `/legal`), formulario "Activar" sin servidor, "Cómo trabajamos", FAQ, enlace de revisión.
- **Desfase detectado:** el `services.config.json` oficial trae **8** servicios (con pack y personaje básico/completo, tipo de cambio 3.4, mensualidad); el sitio usa 6 con datos copiados del boceto. Se reemplaza en la próxima fase. Ya están disponibles WebM, `hero_loop` y `tri_frente.png` (antena de 3 bolitas verificada).
- El sitio no es todavía un monorepo ni tiene CI, base de datos, pagos ni seguridad de producción.

## 7. Arquitectura: dos alternativas
### A. Next.js en Vercel + Supabase + Inngest + worker de contenedor (recomendada)
- **Front/API:** Next.js (App Router, TypeScript estricto). **Datos:** Supabase Postgres con RLS, Auth, Storage. **Jobs:** Inngest (reintentos, idempotencia). **Trabajos pesados** (Blender, sandbox de juego): worker en contenedor (Fly.io/Railway) con red restringida. **Borde:** Cloudflare delante (DNS, WAF, Turnstile, Stream/R2).
- **Ventajas:** la pila más rápida de poner en producción; RLS nativa (seguridad en la base, no solo en el código); Postgres real para analítica y lead scoring; buen soporte de TypeScript y de Mercado Pago/Inngest.
- **Desventajas:** varios proveedores (Vercel, Supabase, Inngest, Fly) = más facturas y más secretos; costo de Vercel crece con el tráfico; funciones serverless no sirven para trabajos largos (de ahí el worker).

### B. Todo en Cloudflare (Workers/Pages + D1/R2 + Queues)
- **Ventajas:** un solo proveedor para hosting, WAF, Turnstile, Stream, R2 y colas; costo de salida bajo; latencia excelente.
- **Desventajas:** Next.js en Workers depende de un adaptador menos maduro; D1 es SQLite (sin RLS, sin extensiones de Postgres): la autorización queda toda en el código, más superficie de error; Auth hay que construirla o integrarla; Mercado Pago/Inngest requieren más trabajo propio.

### Recomendación: A, con Cloudflare solo en el borde
Elegir A porque el mayor riesgo del negocio es la seguridad de pedidos y pagos, y RLS la mueve a la base de datos. Cloudflare aporta lo que hace mejor (DNS, WAF, Turnstile, Stream, R2) sin atar la aplicación. Revisar en un ADR si los costos de Vercel superan el margen.

**Monorepo (pnpm + Turborepo):** `apps/web`, `packages/ui`, `packages/config` (services.config), `packages/db`, `packages/provisioning`, `docs`. Migración desde la estructura actual en un PR aparte, sin cambiar el diseño.

## 8. Decisiones que necesito de ti
1. **¿Validamos precios con "Cotizar" antes de activar pagos?** Recomiendo sí (la Fase 4 espera hasta tener 3 cotizaciones cerradas).
2. **¿Aprobada la arquitectura A?** Si sí, el siguiente bloqueo son las cuentas de Supabase, Vercel y Cloudflare.
3. **¿Adopto ya el `services.config.json` oficial de 8 servicios** (con pack y personaje básico/completo) en el sitio y el catálogo?
