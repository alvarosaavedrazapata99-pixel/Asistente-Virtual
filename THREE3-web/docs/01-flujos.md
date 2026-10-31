# THREE3 — Flujos de información y modelo de datos (v1)

Fuente única de verdad de precios: `packages/config/services.config.json`. **El servidor calcula todo importe; el cliente nunca envía precios.**

## 1. Captación (Instagram → lead)
```mermaid
flowchart LR
  IG[Instagram: reel o comentario con palabra clave] -->|UTM| V[Visita web]
  V --> S[Ver servicio]
  S --> F{Activar / Cotizar}
  F -->|formulario o asistente| L[(leads)]
  L --> C[(consents)]
  L --> N[Aviso: WhatsApp / correo]
  L --> P[Puntaje del lead]
  N --> SEG[Seguimiento automático]
  SEG -->|responde| COT[Cotización enviada]
  COT -->|acepta| O[Pedido]
```
Reglas: sin consentimiento expreso no se guarda el lead; la fuente (`utm_*`) se guarda; ningún evento de analítica lleva PII.

## 2. Compra y pago
```mermaid
sequenceDiagram
  participant U as Cliente
  participant W as Web (servidor)
  participant DB as Postgres (RLS)
  participant MP as Mercado Pago
  participant Q as Cola (Inngest)
  U->>W: Elegir servicio y moneda
  W->>DB: crear order + items (precio desde config)
  W->>MP: crear preferencia (order_id)
  MP-->>U: Checkout Pro
  MP->>W: webhook (x-signature)
  W->>W: verificar firma + idempotencia (event_id único)
  W->>DB: payments + order: pagado + order_events
  W->>Q: encolar comprobante y aprovisionamiento
  Q-->>U: aviso por correo/WhatsApp
```
Controles: firma obligatoria; `webhook_events(provider, event_id)` único (repetir un webhook no cambia nada); reconciliación periódica contra la API de Mercado Pago; si el webhook no llega, el pedido sigue "creado" hasta reconciliar.

## 3. Estados del pedido
```mermaid
stateDiagram-v2
  [*] --> creado
  creado --> pagado: pago confirmado (webhook)
  creado --> fallido: pago rechazado/expirado
  pagado --> en_proceso: aprovisionamiento inicia
  en_proceso --> en_revision: entregable listo
  en_revision --> en_proceso: cambios pedidos
  en_revision --> entregado: aprobado por revisor
  entregado --> cerrado: encuesta o 14 días
  pagado --> reembolsado
  en_proceso --> reembolsado
  en_revision --> reembolsado
  fallido --> [*]
  cerrado --> [*]
  reembolsado --> [*]
```
Solo el servidor mueve estados, con una función `transition(order, to, actor)` que valida la tabla de transiciones y escribe en `order_events` (quién, cuándo, de→a, motivo). El cliente no puede saltarse ningún estado.

## 4. Aprovisionamiento por servicio
| Servicio | Automático | Humano | Entrega |
|---|---|---|---|
| Sheets | Copia de plantilla vía API (OAuth, permisos mínimos) | — | Enlace a la hoja |
| CRM | Plantilla versionada + checklist | Revisión de configuración | Acceso + guía |
| Leads | Workflow n8n parametrizado + prueba de humo | Revisión de la prueba | Flujo activo + reporte |
| Chatbot | Plantilla + base de conocimiento del cliente | Verificación de Meta (pendiente) | Estado `pendiente_verificacion` hasta aprobar |
| Personaje 3D | Moderación del brief | Boceto B/N → aprobación → modelado/render | PNG, turntable, GLB, licencia PDF |
| Videojuego | Moderación + generación en sandbox | Revisión humana obligatoria | Enlace + ZIP + licencia |
```mermaid
flowchart TD
  P[Pedido pagado] --> M{Moderación del brief}
  M -->|rechazado| R[Reembolso o corrección]
  M -->|ok| J[(provisioning_jobs)]
  J --> A[Automatización o taller]
  A --> RV[Revisión humana]
  RV -->|cambios| A
  RV -->|ok| E[Entrega + licencia PDF]
  A -->|falla 3 veces| DL[Dead-letter + alerta]
```
Sandbox de juego: sin secretos, red solo a lista blanca, límites de CPU, tiempo y costo; corre en el worker, nunca en la función web.

## 5. Analítica de embudo (sin PII)
Eventos: `visit` → `service_view` → `activate_click` → `lead_created` → `checkout_start` → `paid` → `delivered`. Atributos permitidos: `utm_*`, `service_id`, `device`, `order_value_bucket`. Prohibido: correo, nombre, celular, IP completa. Solo se mide con consentimiento de cookies analíticas.

## 6. Asistente de ventas (IA propia, fase posterior)
Servidor → Claude API con: prompt versionado, catálogo como única fuente, tope de gasto por conversación y por día, salida validada con Zod, registro de costo en `ai_usage`, identificación obligatoria "asistente virtual", derivación a una persona, y rechazo de instrucciones dentro de mensajes del usuario (defensa contra inyección de prompts). Si la IA falla, el lead se guarda igual y se avisa.

## 7. Modelo de datos
```mermaid
erDiagram
  profiles ||--o{ orders : "compra"
  leads ||--o| orders : "se convierte"
  leads ||--o{ consents : "autoriza"
  orders ||--|{ order_items : "contiene"
  orders ||--o{ order_events : "audita"
  orders ||--o{ payments : "paga"
  orders ||--o{ provisioning_jobs : "ejecuta"
  orders ||--o{ deliverables : "entrega"
  orders ||--o{ licenses : "licencia"
  orders ||--o{ briefs : "describe"
  payments ||--o{ webhook_events : "origina"
  orders ||--o{ ai_usage : "cuesta"
```
| Tabla | Campos clave | RLS (resumen) |
|---|---|---|
| `profiles` | id (= auth.uid), nombre, rol | El usuario lee/edita solo su fila |
| `leads` | id, servicio, contacto, fuente (`utm_*`), puntaje, estado | Insert por servidor; lectura solo staff |
| `consents` | lead_id/user_id, finalidad, texto_versión, fecha, ip_hash | Solo servidor y staff; inmutable |
| `orders` | id, user_id, moneda, total_calculado, estado, version | Cliente lee solo los suyos; escritura solo servidor |
| `order_items` | order_id, service_id, precio_unitario_snapshot | Como `orders` |
| `order_events` | order_id, de, a, actor, motivo, fecha | Solo inserción; lectura del dueño y staff |
| `payments` | order_id, proveedor, provider_payment_id (único), monto, estado | Solo servidor |
| `webhook_events` | proveedor, event_id (único con proveedor), payload, firma_ok | Solo servidor |
| `provisioning_jobs` | order_id, tipo, estado, intentos, error | Solo servidor y staff |
| `briefs` | order_id, tipo, contenido, estado_moderación, declaración_de_autoría | Dueño lee; moderación staff |
| `deliverables` | order_id, ruta en Storage, tipo, checksum | URLs firmadas y temporales para el dueño |
| `licenses` | order_id, tipo, alcance, id_público, pdf | Dueño lee y descarga |
| `ai_usage` | order_id/lead_id, modelo, tokens, costo | Solo servidor y staff |
| `data_requests` | usuario, tipo ARCO, estado, plazo | Dueño y staff |
| `takedown_cases` | denunciante, material, estado | Solo staff |
| `admin_audit` | admin, acción, objeto, fecha | Solo inserción; solo admins |

Principios: todas las tablas con RLS activa y denegación por defecto; migraciones versionadas; `service_role` solo en servidor; backups diarios con prueba de restauración; PII cifrada en reposo y fuera de los logs.
