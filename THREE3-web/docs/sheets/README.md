# Sheet maestro de leads: cómo conectarlo

**Sheet:** https://docs.google.com/spreadsheets/d/1CVCtBeQYdoJSzY1ahOD1LhKQO_60LADnSoy-oyBjfXI/edit (cuenta del dueño).

## Hojas
| Hoja | Contenido |
|---|---|
| Panel | Totales, por servicio/campaña/estado y **estado de integridad** ("OK sin duplicados") |
| Contactos | Una fila por persona. Clave única = correo normalizado o celular normalizado |
| Solicitudes | Una fila por persona + servicio + día. Repetir el mismo día no crea fila: sube `intentos_duplicados` |
| Servicios | Copia de `services.config.json` (tipo de cambio en K1, USD calculado) |
| Fuentes | Etiquetas UTM válidas (Instagram bio, reels, anuncios) |
| Listas | Opciones de los desplegables |
| Auditoria | Evento por cada envío: creado, duplicado, reintento, inválido |

Protecciones: encabezados congelados, desplegables estrictos (estado, dispositivo, servicio), resaltado rojo si una clave se repite y control en el Panel.

## Conectar el formulario (5 pasos, los haces tú)
1. Abre el Sheet → **Extensiones → Apps Script**.
2. Borra el contenido y pega todo `docs/sheets/Codigo.gs` (se regenera con `node scripts/leads/build-apps-script.js`).
3. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: *yo*. Acceso: *cualquier persona*. Copia la URL que termina en `/exec`.
4. En el hosting (Vercel) crea la variable `NEXT_PUBLIC_LEADS_ENDPOINT` con esa URL y vuelve a desplegar.
5. Envía un lead de prueba desde la web y comprueba que aparece en Contactos, Solicitudes y Auditoria.

Sin la variable, el formulario sigue funcionando en modo manual (la persona copia su solicitud y la envía por Instagram).

## Reglas anti-duplicado (iguales en el simulacro y en el Sheet)
1. **Normalización:** correo en minúsculas; celular solo dígitos, sin 51, 9 dígitos que empiezan con 9.
2. **Idempotencia:** cada apertura del formulario genera una clave; el doble clic o un reintento se ignora.
3. **Contacto único** por correo o celular; **solicitud única** por contacto + servicio + día.
4. **Un bloqueo** (`LockService`) hace que las escrituras ocurran de una en una.
5. **Campo trampa** invisible: si un bot lo llena, el envío se descarta.
Limitación conocida: la misma persona con solo correo en un envío y solo celular en otro queda como dos contactos hasta que un envío traiga ambos.

## Límites que debes conocer
- Apps Script y Google Sheets **no son una base de datos para miles de envíos simultáneos**. Cada escritura toma del orden de cientos de milisegundos y el bloqueo las pone en fila; con muchas personas a la vez, algunas esperarán o recibirán "ocupado" (el formulario las deja en modo copiar y enviar). Las cuotas de Google también limitan las llamadas **[VALIDAR en la documentación de Google]**.
- El endpoint de Apps Script es público. El campo trampa frena bots simples, pero **no reemplaza** a Cloudflare Turnstile ni a limitar la frecuencia de envíos.
- **Camino recomendado** (ADR 0008): guardar los leads en Postgres (Supabase), donde un índice único impide duplicados aunque lleguen miles a la vez, y copiar al Sheet cada minuto como vista de trabajo. El Sheet y su lógica se conservan.

## Probar la lógica
- `node scripts/leads/prueba-unitaria.js`: 17 comprobaciones.
- `node scripts/leads/simulacro.js --md`: bots concurrentes; escribe `docs/simulacro-leads.md`.
