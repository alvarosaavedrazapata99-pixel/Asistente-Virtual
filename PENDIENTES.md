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
