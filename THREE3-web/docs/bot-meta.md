# Bot de WhatsApp e Instagram (Meta)

Estado: **construido y probado con simulaciones; apagado** hasta cargar las llaves. Ruta: `POST/GET /api/meta` (`worker/index.ts` → `functions/api/meta.ts` → `server/bot/`).

## Qué hace
1. Meta avisa de cada mensaje a `/api/meta`. Se verifica la firma `x-hub-signature-256` (HMAC con el secreto de la app); sin firma válida → 401.
2. Un id de mensaje repetido no se procesa dos veces (columna `msg_id` única en `mensajes_bot`).
3. Límite: 20 mensajes por persona cada 10 minutos.
4. Si la persona pide un humano o reclamo → responde el texto de derivación (sin gastar el modelo).
5. Si no, responde Claude con instrucciones que salen de `src/config/planes.config.json` (precios reales, "desde", aclaración de Meta/dominio/hosting). Se identifica como IA.
6. Si el modelo o el envío fallan, la persona recibe el texto de derivación; nunca queda sin respuesta.
7. Todo se guarda en Supabase (`mensajes_bot`, migración `supabase/migrations/0002_bot.sql`).

## Variables (Cloudflare → Settings → Runtime variables and secrets)
| Nombre | Tipo | Qué es |
|---|---|---|
| `BOT_ACTIVO` | Texto | `si` para encender; cualquier otro valor lo deja apagado |
| `BOT_MODELO` | Texto (opcional) | por defecto `claude-haiku-5-5` |
| `WHATSAPP_PHONE_ID` | Texto | ID del número en Meta (no es el número) |
| `WHATSAPP_HUMANO` | Texto | número al que se deriva, p. ej. `51934467321` |
| `META_APP_SECRET` | **Secreto** | secreto de la app de Meta |
| `META_VERIFY_TOKEN` | **Secreto** | texto inventado por ti; el mismo se escribe en Meta al registrar el webhook |
| `WHATSAPP_TOKEN` | **Secreto** | token permanente del usuario del sistema |
| `INSTAGRAM_TOKEN` | **Secreto** | token de la página/cuenta de Instagram (si se usa) |
| `ANTHROPIC_API_KEY` | **Secreto** | llave de la API de Anthropic |

## Pasos para encenderlo
1. Supabase → SQL Editor → pegar y ejecutar `supabase/migrations/0002_bot.sql`.
2. Meta for Developers: crear app tipo Business, agregar WhatsApp, vincular el número, crear usuario del sistema y token permanente.
3. Meta → WhatsApp → Configuración → Webhook: URL `https://www.three3agency.com/api/meta`, token de verificación = `META_VERIFY_TOKEN`; suscribir el campo `messages`.
4. Cargar las variables de arriba y poner `BOT_ACTIVO=si`.
5. Probar escribiendo al número desde otro celular. Revisar `mensajes_bot`.

## Límites conocidos
- Solo texto. Imágenes, audios y reacciones se ignoran.
- Responder libremente solo es posible dentro de las 24 h posteriores al último mensaje de la persona (regla de Meta).
- No avisa todavía al dueño cuando alguien pide un humano (pendiente: aviso por correo o WhatsApp).

## Demo con IA real en la web (`/api/demo-chat`)
Apagada por defecto. Para encenderla: cargar `ANTHROPIC_API_KEY` (secreto) y `DEMO_IA_ACTIVA=si` (texto) en Cloudflare. La demo de la home muestra entonces una caja "escríbele lo que quieras"; si está apagada, solo se ven los botones.
- Protecciones: solo acepta peticiones desde tu propio dominio, 20 consultas por IP por hora, tope global de 400 consultas por día, mensajes de máx. 300 caracteres y 8 turnos de historial.
- IMPORTANTE: sin un KV de Cloudflare (binding `LIMITES`) los contadores son por instancia y el tope diario no es exacto. Crear un KV `LIMITES` (Workers & Pages → KV) y añadirlo en Bindings. Además, fijar un límite de gasto mensual en la consola de Anthropic.
- Negocios de ejemplo (ficticios): `server/demo/chat.ts`.

## Base de conocimiento (reglas para nuevas consultas)
`src/config/conocimiento.config.json` reúne lo que el bot de THREE3 debe saber: quiénes somos, cómo funciona, canales, CRM y reportes, costos aparte, demo, preguntas frecuentes, cómo conversar y qué nunca hacer. Se lee entera junto con los planes (`planes.config.json`) cada vez que el bot arma sus instrucciones (`server/bot/cerebro.ts`).
- Para cambiar lo que responde: edita el texto del JSON, haz commit y se despliega solo. No hace falta tocar código.
- Lo que no esté ahí, el bot no lo sabe y deriva a una persona.
- No pongas llaves, contraseñas ni datos personales en ese archivo.
- Cuesta poco: son unos 1,500 tokens más por consulta (con Haiku 5.5 son fracciones de centavo).
- El bot de cada cliente (widget) usa la descripción de su negocio, no este archivo.
