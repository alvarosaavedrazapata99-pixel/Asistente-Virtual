# Lista de control: enlazar la web al perfil de Instagram

Estado al 31-oct-2026. ✅ hecho · ⏳ lo haces tú · 🟡 lo hacemos juntos.

## A. Antes de compartir con 10–20 personas
| # | Paso | Estado |
|---|---|---|
| 1 | Precios de ejemplo apagados: solo "Cotizar" | ✅ |
| 2 | Página `/ig` para la biografía (un toque abre el formulario con el servicio elegido; etiquetas UTM automáticas) | ✅ |
| 3 | Datos de la empresa en un solo archivo (`src/config/empresa.config.json`) y `/legal` los usa | ✅ (faltan los datos) |
| 4 | Publicar en Vercel (guía: `docs/despliegue.md`) | ⏳ |
| 5 | Pegar el script en Apps Script y definir `NEXT_PUBLIC_LEADS_ENDPOINT` (guía: `docs/sheets/README.md`) | ⏳ |
| 6 | Completar `empresa.config.json`: razón social, RUC, domicilio, correo (y WhatsApp si lo hay) | ⏳ |
| 7 | Prueba completa en el navegador de Instagram (ver sección C) | 🟡 |

## B. Antes del enlace permanente y de anuncios pagados
| # | Paso | Estado |
|---|---|---|
| 8 | Revisión de abogado y contador de `/legal` | ⏳ |
| 9 | Dominio propio (`three3agency.com`) conectado | ⏳ |
| 10 | Precios validados con 3 cotizaciones (luego `MOSTRAR_PRECIO_EJEMPLO` y `publicar`) | ⏳ |
| 11 | Definir quién responde los leads y en cuánto tiempo (el negocio se gana o se pierde ahí) | ⏳ |
| 12 | Quitar `noindex`: variable `NEXT_PUBLIC_NOINDEX=0` | 🟡 al lanzar |

## C. Prueba en el navegador interno de Instagram (5 minutos, en tu celular)
Instagram abre los enlaces dentro de su propio navegador, que se comporta distinto a Chrome o Safari.
1. Envíate por mensaje directo la dirección `https://TU-DIRECCION/ig` (después de publicar en Vercel).
2. Ábrela **desde Instagram**. Comprueba: ves a Tri, los botones son grandes y no hay scroll lateral.
3. Toca "CRM": debe abrirse el formulario con CRM elegido y sin que salte el teclado.
4. Llena el formulario con tus datos y envía. Debe decir "Recibimos tu solicitud".
5. Abre el Sheet: debe aparecer una fila en Contactos, otra en Solicitudes con `utm_campaign = link-bio`, y un evento en Auditoria.
6. Vuelve a enviar lo mismo: en Panel, "Duplicados bloqueados" sube en 1 y no se crea fila nueva.
7. Toca "Ver todos los servicios" y revisa los videos, el menú y el botón fijo.
8. Repite en un celular Android y en uno iPhone si puedes.
Si algo falla, anota qué toqué y qué viste y me lo cuentas.

## D. Qué es nuestro "Linktree" y por qué no usamos uno externo
`/ig` es nuestra propia página de enlaces. Frente a Linktree: el formulario se abre de un toque con el servicio elegido, cada lead llega al Sheet con su etiqueta (qué reel o anuncio lo trajo), el diseño es 100% THREE3 y los datos son tuyos. Linktree sirve si no queremos tocar nada, pero no conecta con el formulario ni con el Sheet.
- **Páginas por campaña:** `/ig/automatizacion`, `/ig/personaje` y `/ig/pack`. Cada una destaca otro servicio y usa su propia etiqueta (`bio-<nombre>`), para saber cuál enlace de historias o de biografía convierte mejor.
- **Se editan sin código:** `src/config/ig.config.json` (destacado y campañas). Los textos actuales son de ejemplo.
- **Medición anónima:** cada visita y cada clic se registra en la hoja Eventos del Sheet, sin cookies ni datos personales. El Panel muestra visitas, clics y leads por campaña. Requiere haber pegado de nuevo `Codigo.gs` (versión nueva) y tener `NEXT_PUBLIC_LEADS_ENDPOINT`.
- **Código QR** para afiches y tarjetas: `node scripts/qr.js https://TU-DIRECCION/ig ig` (genera PNG y SVG en `docs/qr/`).

## E. Simulación para revisar
Hay un artefacto con un perfil de ejemplo: al tocar el enlace de la biografía se abre la página `/ig` real y, al lado, se ve lo que recibiría el Sheet (visitas, clics, solicitudes, duplicados bloqueados). Se regenera con `python3 scripts/simulacion-ig/construir.py`.

## F. Cómo enlazar en Instagram
- **Biografía:** `https://TU-DIRECCION/ig`
- **Historias o publicaciones concretas:** `https://TU-DIRECCION/ig/automatizacion`, `/ig/personaje` o `/ig/pack`
- **Historias con enlace:** el mismo, con `?utm_campaign=historia-<tema>` para saber qué historia convierte.
- **Anuncios:** `https://TU-DIRECCION/?utm_source=instagram&utm_medium=ads&utm_campaign=<nombre-campaña>` (el nombre debe existir en la hoja Fuentes).
- **Reels con palabra clave:** `…&utm_medium=reel&utm_campaign=automatizacion`.

## Compatibilidad
El formulario necesita `<dialog>` (iPhone con iOS 15.4 o superior, Android con Chrome/WebView reciente). En navegadores más viejos los botones llevan a la sección de contacto sin romperse.
