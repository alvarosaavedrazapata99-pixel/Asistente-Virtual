# Bot incrustable (widget) para clientes

Un cliente pega **una línea** en su página y le aparece un chat con IA que conoce su negocio.

```html
<script src="https://www.three3agency.com/widget.js" data-cliente="don-beto" defer></script>
```

## Cómo funciona
- `public/widget.js`: botón flotante + chat en un Shadow DOM (no choca con los estilos del cliente). Sin cookies ni almacenamiento local.
- `GET /api/widget?c=<id>&a=config`: datos públicos (nombre, saludo, color, WhatsApp). `POST …&a=chat`: una consulta a la IA. `POST …&a=lead`: el visitante deja nombre y contacto (con casilla de consentimiento).
- Código: `server/widget/` (lógica y pruebas), `functions/api/widget.ts`, tablas en `supabase/migrations/0003_widget.sql`.

## Seguridad
- Solo responde en los **dominios registrados** del cliente (comparación exacta del origen, p. ej. `https://www.donbeto.pe`). Otro sitio recibe 403 y sin cabeceras CORS.
- Cliente inactivo o inexistente → 404 y el widget no aparece.
- 30 consultas por IP por hora, 5 envíos de datos por IP por hora, y un **tope diario por cliente** (`limite_diario`).
- Mensajes de máx. 300 caracteres y 8 turnos de historial. El bot se identifica como IA, no inventa datos fuera de la descripción y deriva a una persona lo que no sabe.
- El texto del visitante nunca va en la URL.
- Los datos de contacto se guardan en `leads_cliente` (RLS, solo servidor). **El cliente es responsable del tratamiento de sus datos:** conviene que su página tenga política de privacidad y mencionar a THREE3 como proveedor.

## Panel en `/admin` (sin SQL)
Entra a `/admin` con tu `ADMIN_TOKEN` → pestaña **Clientes del bot**: crear y editar clientes (nombre, lo que sabe el bot, saludo, color, WhatsApp, dominios permitidos, tope diario, activo), copiar el fragmento de código y ver los clientes potenciales de cada uno. API: `/api/admin/clientes` (solo con la clave de administración; valida dominios sin ruta, color, límites). Requiere haber ejecutado `0003_widget.sql` una vez.

## Alta de un cliente por SQL (alternativa)
1. Supabase → SQL Editor, una sola vez: ejecutar `supabase/migrations/0003_widget.sql`.
2. Crear al cliente (con `activo = false` hasta probarlo):
```sql
insert into clientes_bot (id, nombre, descripcion, saludo, color, whatsapp, dominios, activo, limite_diario)
values (
  'don-beto', 'Pollería Don Beto',
  'Pollo a la brasa (1/4, 1/2, entero), parrillas y guarniciones. Atendemos todos los días de 12:00 m. a 11:00 p. m. Delivery en la zona. Teléfono de pedidos: ...',
  '¡Hola! Soy el asistente virtual de Pollería Don Beto. ¿En qué te ayudo?',
  '#C0392B', '51999111222', array['https://www.donbeto.pe'], false, 300
);
```
3. Probar desde su dominio, luego `update clientes_bot set activo = true where id = 'don-beto';`.
4. Enviarle el fragmento. Para ver sus leads: tabla `leads_cliente` (o pedir que se añada a `/admin`).

## Encender la IA
Cloudflare → Runtime variables and secrets: `ANTHROPIC_API_KEY` (**Secret**) y `WIDGET_IA_ACTIVA` = `si` (Text). Sin eso, el widget solo ofrece "Dejar mis datos" y WhatsApp. Igual que el resto: crear el KV `LIMITES` para que los topes sean exactos y poner límite de gasto en Anthropic.

## Bot propio de THREE3
La home carga el widget con `data-cliente="three3"`. Se activa creando la fila `three3` con `dominios = array['https://www.three3agency.com']` y `activo = true`.

## Límites actuales
Solo texto; sin panel para editar la descripción (se edita en Supabase); sin conexión a WhatsApp (eso es el bot de Meta, `docs/bot-meta.md`); un solo idioma por cliente.
