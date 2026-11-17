# Traspaso de sesión (17-nov-2026)

Léelo primero en la nueva sesión. Todo lo demás está en el repositorio (`THREE3-web/docs/`, `CLAUDE.md`).

## 1. Dónde estamos (una frase)
Pasamos de analizar a **validar con clientes reales**: estrategia C = mantener el bot como activo y probar un producto de fidelización por WhatsApp con cafeterías de Pueblo Libre, usando como gancho un servicio gratis de **Google Maps**. Modo de trabajo: `docs/modo-mentor.md` (ya importado en `CLAUDE.md`).

## 2. Decisiones del dueño
- No más web multipropósito ni funciones sin justificación comercial.
- 3 pilotos, prueba de 30 días, procesos manuales, sin gasto de dinero.
- Precio de referencia ~US$ 15/mes, **sin fijar** hasta validar disposición de pago.
- Gancho de entrada: completar gratis la ficha de Google Maps de una cafetería. El Club de sellos por WhatsApp va **después** (se menciona solo como «más adelante»).
- No usar trabajos de otros locales como propios. Solo ejemplo ficticio marcado y el primer caso real con permiso escrito.
- Se presentará con la **marca de Diego** (amigo con agencia audiovisual, folleto «SUPERNOVA BROCHURE» en Canva). Pendiente confirmar nombre exacto de marca, nombres del equipo y el WhatsApp de contacto.

## 3. Cliente objetivo de hoy: Raíces (Café & Wine)
Datos públicos, vistos desde la nube (confirmar en celular antes de ir):
- Instagram `@somosraices.pe`: «Café & Wine», ~479 seguidores, 81 publicaciones, enlace de la bio lleva a Maps.
- Maps: 4.8 estrellas, 17 reseñas, horario 8:30–22:00 todos los días, **«Claim this business» (sin reclamar)**, **sin teléfono**, web = su Instagram.
- Afiches de Instagram muestran un teléfono de reservaciones (955 944 257, leído de una imagen; confirmar). Tienen tarjeta física de lealtad, eventos, sorteos y alianza con otra empresa.
- Colores de marca: vino `#6A1D31`, terracota `#824214`, crema `#F4E8DD`.

## 4. Archivos y recursos
| Qué | Dónde |
|---|---|
| Presentación para Raíces (5 diapositivas, HTML sin internet, marca y nombres por `?marca=...&equipo=...&tel=...`) | `scratchpad/propuesta-raices.html` (se envió por chat; si no está, regenerar con fotos recortadas de las capturas del Instagram) |
| Hoja de prospectos de cafeterías (8 de 30 filas) | Google Sheets «THREE3 - Cafeterías Pueblo Libre (prospectos)», id `1fFupbxjP7YThFc7PJ_iqNRENGkna6cffxpU6gxVc2aA` |
| Plantilla de Google Maps (datos, 8 fotos, prompt, checklist, reglas) | `docs/plantilla-google-maps.md` |
| Estrategia y 8 informes consolidados | `docs/estrategia-fidelizacion.md` |
| Seguridad y operación | `docs/seguridad-y-operacion.md` |
| Base de conocimiento del bot | `docs/base-conocimiento.md`, `src/config/conocimiento.config.json`, `planes.config.json`; copia editable en Notion «THREE3 — Base de conocimiento» |
| Enlace de revisión de la web | https://claude.ai/artifact/CLQScQh66UhvBtLBY34uXj (versión 20) |

## 5. Estado técnico de la web y el bot
- Web en producción `www.three3agency.com` (Cloudflare Workers, rama `three3-web-carga`), con demo de 29 negocios, diagnóstico, planes y preguntas.
- WhatsApp de contacto: +51 934 467 321 (`whatsapp_activo: true`).
- **Bot de Meta apagado** (`BOT_ACTIVO` sin `si`). Faltan: ejecutar migraciones 0002–0005 en Supabase, crear app en Meta, token, `META_*`, `ANTHROPIC_API_KEY`, KV `LIMITES`, RUC y verificación de Meta. Detalle en `docs/bot-meta.md` y `docs/seguridad-y-operacion.md`.
- Auditoría de seguridad hecha y correcciones subidas. Pendientes: KV `LIMITES`, Turnstile en el widget, confirmación del correo en el diagnóstico.
- 102 pruebas pasan (`npm test`).

## 6. Pendientes inmediatos (en orden)
1. Presentar a Raíces hoy (con socio, laptop): 5 diapositivas, mensaje único = «que más gente los encuentre en Google». Anotar sus palabras exactas.
2. Terminar la presentación combinada con la marca de Diego (necesita: nombre de marca, nombres, WhatsApp, 4 o 5 capturas del folleto, aprobación de Diego).
3. Registrar el resultado de la visita en la hoja de prospectos (columnas: atendió el dueño, aparece en Maps, qué le falta, tarjeta de sellos, reacción, aceptó, objeción textual, próximo paso).
4. Si acepta: seguir `docs/plantilla-google-maps.md` (la dueña crea/reclama su ficha, agrega a ustedes como administradores; el perfil queda a su nombre).
5. Preguntar a Diego/primo por Maps: precio, tiempos, verificación, quién queda como dueño del perfil.
6. Tramitar RUC y verificación de Meta en paralelo (ruta crítica para el bot de WhatsApp).

## 7. Reglas que no se rompen
- Nunca pegar llaves ni contraseñas en el chat. Los secretos van solo en paneles (Cloudflare, Supabase, Meta).
- No prometer ventas ni porcentajes. No hablar de IA, bot, base maestra ni precios en la primera visita.
- El perfil de Google siempre queda a nombre del dueño. Nada de reseñas falsas ni de pedir contraseñas.
- No presentar trabajos ajenos como propios.
- Pagos con Mercado Pago solo en modo prueba hasta aprobación expresa.

## 8. Limitaciones de la sesión en la nube
- No hay navegador propio: `instagram.com`, `maps.app.goo.gl`, `facebook.com`, `gob.pe` y Canva no resuelven desde la red de la sesión. Se usó TinyFish (navegador en la nube, consume créditos) para leer páginas públicas.
- No puedo escribir en el computador del dueño (`C:\Users\User\.claude\`); allí quedaron `CLAUDE.md` y `base-conocimiento.md` que él colocó a mano.

## 9. Para la nueva sesión con navegador
Abrirla en la app de escritorio de Claude o en Claude Code con la extensión de Chrome, en la carpeta del proyecto. Con navegador propio se podrán revisar el folleto de Canva, el Instagram y la ficha de Maps de Raíces, y se evitará depender de capturas.
