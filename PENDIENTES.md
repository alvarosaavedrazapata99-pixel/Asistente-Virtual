# PENDIENTES · THREE3-web (se actualiza en cada avance)

Última actualización: 3-nov-2026. Rama: `three3-web-carga`, carpeta `THREE3-web/`.

## En curso (esta tanda)
- [ ] Planes y precios nuevos (Inicial, Profesional, Avanzado, módulo leads y CRM) con la aclaración de WhatsApp, dominio y hosting
- [ ] Secciones "Cómo trabajamos" (5 pasos) y "Después de tu bot"
- [ ] Botón ámbar "Agendar diagnóstico" a WhatsApp
- [ ] Paleta nueva y fuentes (Michroma + Inter)
- [ ] `/legal`: privacidad (Ley 29733), términos, consumidor, derechos reservados
- [ ] Videos con versión ligera para celular
- [ ] Mercado Pago forzado a modo de prueba
- [ ] Pruebas en celular y escritorio, y resumen final

## Datos que solo tú puedes dar (bloquean el lanzamiento)
- [ ] Número de WhatsApp Business (hasta tenerlo, "Agendar diagnóstico" abre el formulario)
- [ ] Razón social, RUC, domicilio y correo de contacto (`THREE3-web/src/config/empresa.config.json`)
- [ ] Qué incluye exactamente cada plan (hoy el texto de cada plan es general y dice que el alcance se define en el diagnóstico)
- [ ] Cuentas: Cloudflare Pages, Supabase, Mercado Pago (credenciales de prueba), Turnstile. Guía: `THREE3-web/docs/pagos-seguridad.md`
- [ ] Dominio (`three3agency.com`) y correo con el dominio
- [ ] Revisión de abogado y contador de `/legal` y de los precios

## Decisiones que te tocan
- [ ] Aprobar el paso de Mercado Pago a producción (hoy el código lo impide aunque se configure: hace falta `MP_MODO=produccion` y `MP_PRODUCCION_APROBADA=si`)
- [ ] Confirmar que "desde" aplica a los cuatro precios

## Técnicos pendientes
- [ ] Hoja "Servicios" del Sheet maestro con los planes nuevos (hoy tiene el catálogo anterior)
- [ ] Reducir el JavaScript inicial a 170 KB (CI falla sobre 190 KB)
- [ ] Robots, sitemap, imagen para compartir y datos estructurados (al lanzar)
- [ ] Monitoreo de disponibilidad y alertas
- [ ] Política de retención de datos personales


## Estado al cierre de esta tanda
Hecho: planes en soles con aclaración Meta/dominio/hosting, "Cómo trabajamos", "Después de tu bot", botón ámbar, paleta y fuentes nuevas, /legal solo texto (privacidad, términos, consumidor, derechos), videos livianos `_sm`, Mercado Pago forzado a prueba, CSP 0 violaciones, sin desborde horizontal en móvil/escritorio, enlace de revisión republicado.
Pendiente:
- WhatsApp cargado (51922075014). Falta activar WhatsApp Business en un celular para poder responder.
- Datos legales (razón social, RUC, domicilio; correo ya puesto: three.3agencyweb@gmail.com) y revisión de abogado de /legal.
- Actualizar pestaña "Servicios" del Sheet y regenerar/pegar `docs/sheets/Codigo.gs` (core.js cambió).
- JS de la página ≈190 KB gzip (meta 170 KB); videos de svc_* no usados en la home aún sin `_sm`.
- Conexiones reales (Cloudflare, Supabase, Mercado Pago, Turnstile) sin probar: requieren tus cuentas.
- Lighthouse real, robots/sitemap/OG.

## Despliegue en Cloudflare (en curso)
- (arreglo: src/lib ya está en GitHub) Proyecto Workers `three3-web` conectado al repo; rama de producción `three3-web-carga`, raíz `THREE3-web`, build `npm run build:cf`, deploy `npx wrangler deploy` (usa `wrangler.jsonc` + `worker/index.ts`).
- Falta: secretos en Cloudflare (SUPABASE_URL, SUPABASE_SERVICE_KEY, TURNSTILE_SECRET, ADMIN_TOKEN, MP_ACCESS_TOKEN de prueba, MP_WEBHOOK_SECRET, SITE_URL, ENTORNO) y conectar el dominio three3agency.com.

## Bot de Meta (construido, apagado)
- Código listo y probado (48 pruebas): `server/bot/`, ruta `/api/meta`, doc en `THREE3-web/docs/bot-meta.md`.
- Falta (solo tú): WhatsApp Business activo en el iPhone; cuenta de Meta for Developers + verificación; llave de Anthropic; ejecutar `0002_bot.sql` en Supabase; cargar variables y poner `BOT_ACTIVO=si`.
- Pendiente de código: aviso al dueño cuando alguien pide un humano.

## Actualización (5 nov)
- WhatsApp: el número 51922075014 está guardado pero `whatsapp_activo: false` en `THREE3-web/src/config/empresa.config.json` (posible baja de la línea; Entel). Mientras sea false, el botón ámbar abre el formulario (que sí guarda en Supabase). Cuando el número responda en WhatsApp: ponerlo en `true` (o pedirlo a Claude) y se activa el enlace.
- Panel privado de solicitudes: `/admin` (pide `ADMIN_TOKEN`; ver y cambiar estado: nueva/contactada/cotizada/aceptada/perdida). API: `/api/admin/leads`. No está enlazado desde ninguna página.
- `robots.txt` y `sitemap.xml` listos: hoy bloquean todo (noindex) hasta poner `NEXT_PUBLIC_NOINDEX=0` en Builds al lanzar.
- Lighthouse móvil (5 nov, local, simulado): Rendimiento 77, Accesibilidad 100, Buenas prácticas 100, SEO 66 (solo por `noindex`, se resuelve al lanzar). LCP 5,5 s y bloqueo total 190 ms: el JS pesa ~188 KB gzip (Lighthouse estima 173 KB sin usar). Mejora pendiente: reducir JS de la home (pasar secciones a componentes de servidor/diferir `LoopVideo` y `Reveal`) y medir el LCP real en el dominio publicado.

## Presentación y precios (5 nov)
- `/presentacion`: presentación de 8 diapositivas (general). Desde `/admin`, el botón "Presentar" de cada solicitud abre la versión personalizada (nombre, negocio, lo que escribió y plan sugerido). Los datos viajan en sessionStorage de esa pestaña, nunca en la URL. "Guardar PDF" imprime una diapositiva por página.
- Precios en la home: por defecto bajo el botón "Ver inversión" de cada plan. Para mostrarlos siempre: `mostrar_precios: "abierto"` en `THREE3-web/src/config/planes.config.json`.
- Demo interactiva en la home (`#demo`, "Pruébalo tú mismo"): bot simulado con 3 negocios de ejemplo → registro en un mini CRM → reporte. Todo en el navegador (`public/demo.js`), sin red ni IA. Mejora futura: sustituir por IA real vía `/api/demo-chat` cuando el bot de Meta esté encendido (con límite por IP y Turnstile).
- Demo con IA real lista y apagada (`/api/demo-chat`, 63 pruebas). Para encender: `ANTHROPIC_API_KEY` (secreto) + `DEMO_IA_ACTIVA=si`; crear KV `LIMITES` y límite de gasto en Anthropic (ver `THREE3-web/docs/bot-meta.md`).
- Siguiente producto: bot incrustable para páginas de clientes (`<script src=".../widget.js" data-negocio="...">`). No construido.
- Bot incrustable para clientes (`<script src=".../widget.js" data-cliente="id">`): construido y probado (76 pruebas + navegador entre dos orígenes). Falta: ejecutar `0003_widget.sql` en Supabase, crear la fila `three3` (bot propio) y de cada cliente, y encender IA (`ANTHROPIC_API_KEY` + `WIDGET_IA_ACTIVA=si`). Guía: `THREE3-web/docs/widget.md`.
- Mejora futura: panel en `/admin` para crear clientes del widget y ver sus leads sin SQL.
- Menús animados (5 nov): barra de progreso de lectura, subrayado animado en el menú, vista previa con video (versión `_sm`) al pasar el cursor por cada sección, menú móvil con miniaturas en video que se cargan solo al abrirlo, entrada escalonada y botón hamburguesa animado, elevación al pasar el cursor en tarjetas, pulso suave en el botón ámbar. Respeta movimiento reducido y ahorro de datos (solo imagen fija). Mapa de videos por sección en `src/app/page.tsx` (`MENU`).
