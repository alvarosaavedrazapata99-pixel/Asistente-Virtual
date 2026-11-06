# Seguridad y operación — THREE3

Estado a noviembre de 2026. Checklist para antes y después de lanzar. Lo marcado ✅ ya está en el código; lo marcado 🔲 lo haces tú en un panel (nunca pegues llaves en el chat).

## Ya está en el código ✅
- HTTPS obligatorio (HSTS), `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
- Política de contenido (CSP) por página con hash; probada en 12 páginas (`node scripts/probar-csp.mjs`, 0 violaciones).
- Referrer-Policy y Permissions-Policy cerrados; `X-Content-Type-Options: nosniff` y `Cache-Control: no-store` en todas las respuestas de `/api/*`.
- Formularios con Turnstile verificado en el servidor, campo trampa (honeypot) y límite de intentos por IP.
- Panel admin: llave de administración comparada en tiempo constante y con límite de intentos.
- Llaves solo como secretos de Cloudflare; ninguna en el código ni en `NEXT_PUBLIC_*`.
- Base de datos con RLS activado y sin políticas públicas (solo el servidor accede con la llave secreta).
- Sin datos personales en la dirección (URL).
- Dependencias: `npm audit` sin vulnerabilidades conocidas.
- Pagos de Mercado Pago solo en modo prueba hasta aprobación expresa.

## Para hacer en Cloudflare 🔲
1. **Reglas de límite (WAF → Rate limiting)**: 30 solicitudes/min por IP a `/api/*`; 10/min a `/api/diagnostico` y `/api/leads`.
2. **Crear el KV `LIMITES`** y enlazarlo: sin él, el límite de intentos vive en memoria de cada instancia y se reinicia.
3. **Bot Fight Mode** activado (Security → Bots).
4. **SSL/TLS** en modo Full (strict) y «Always Use HTTPS».
5. **Turnstile** en modo gestionado con el sitekey correcto.
6. **Secretos** solo en Settings → Runtime variables and secrets: `ADMIN_TOKEN`, `SUPABASE_SERVICE_KEY`, `TURNSTILE_SECRET`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, claves de Meta y Mercado Pago. Rótalos si alguna vez se mostró una.
7. **Límite de gasto** en la consola de Anthropic (el bot y la demo con IA consumen API).
8. **Web Analytics** (sin cookies): Analytics & Logs → Web Analytics → Add a site.

## Para hacer en Supabase 🔲
1. Ejecutar las migraciones 0002–0005 en el SQL Editor.
2. Revisar que todas las tablas muestren RLS «enabled».
3. Pasar a plan Pro antes de vender (copias de seguridad diarias, sin pausa por inactividad).
4. Probar una restauración de copia al menos una vez.

## Cuentas y accesos 🔲
- Autenticación en dos pasos (2FA) en: Cloudflare, GitHub, Supabase, Meta, Google, Anthropic, Resend, Mercado Pago.
- Una sola persona con acceso de administrador; el resto con permisos mínimos.
- Guardar los códigos de recuperación fuera del computador.
- Correo de la empresa con SPF, DKIM y DMARC (Resend te da los registros DNS).

## Meta / WhatsApp / Instagram 🔲
- Verificar el webhook con la firma (`META_APP_SECRET`) — ya se valida en el servidor.
- Token de acceso permanente de usuario del sistema, no personal.
- Revisar que el bot siempre se identifique como asistente virtual y derive a una persona.

## Datos personales (Ley 29733) 🔲
- Revisión de abogado de `/legal`.
- Inscripción del banco de datos si corresponde, y responsable designado.
- Política de borrado: borrar diagnósticos y leads a solicitud.

## Al lanzar 🔲
- Poner `NEXT_PUBLIC_NOINDEX=0` en Settings → Builds y volver a desplegar.
- Verificar el sitio en Google Search Console.
- Probar el flujo completo: diagnóstico → correo → panel admin.

## Si algo sale mal
1. Rotar el secreto afectado en Cloudflare (Settings → Runtime variables and secrets).
2. Apagar el bot: `BOT_ACTIVO=no`, `WIDGET_IA_ACTIVA=no`, `DEMO_IA_ACTIVA=no` (en `wrangler.jsonc` o en el panel).
3. Revisar registros en Cloudflare (Workers → Logs) y la tabla `uso_ia`.
