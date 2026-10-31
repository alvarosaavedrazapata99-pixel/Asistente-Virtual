# Hoja de ruta THREE3-web (31-oct-2026)

## Hecho
- Fase 0: análisis. Fase 1: web fiel al boceto (servicios con video, personaje 3D, muro de videos, /legal).
- Flujo "Activar": formulario validado con consentimiento no premarcado; arma la solicitud para copiar y enviar por Instagram.
- "Cómo trabajamos" (3 pasos) y preguntas frecuentes. Enlace de revisión se republica tras cada cambio.

## Falta, en orden de impacto en ventas
1. **Recibir solicitudes de verdad** (hoy dependen de que la persona pegue el texto en Instagram). Necesito: cuenta de Supabase (o similar) y un correo/WhatsApp de aviso. Es el cambio que más convierte.
2. **Número de WhatsApp Business** para el botón directo y la derivación del chatbot.
3. **Precios reales** (3 cotizaciones) y quitar los "de ejemplo".
4. **Pagos** (Mercado Pago sandbox) + estados del pedido + licencia en PDF. Solo después de validar demanda con cotizaciones.
5. **Panel del cliente** (pedidos, estado, entregables).
6. **Asistente de ventas con IA propia** (API de Claude con límite de gasto, restringido al catálogo; se identifica como asistente virtual).
7. **Instagram real** (Graph API) y página `/ig` con UTM.
8. **Seguridad y carga**: CSP, rate limiting, Turnstile, pruebas k6, monitoreo.
9. **Producción**: dominio, SSL, Vercel/Cloudflare, WebM y `hero_loop`.

## Datos que me bloquean
Dominio, razón social/RUC, WhatsApp, cuenta Supabase, cuenta Mercado Pago (modo prueba), textos legales revisados por abogado.
