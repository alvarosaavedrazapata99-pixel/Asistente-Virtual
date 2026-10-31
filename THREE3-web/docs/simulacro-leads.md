# Simulacro de leads (2026-10-31)

Bots concurrentes: **200** · envíos totales: **4131** (3934 válidos + 197 inválidos) · personas: **1500** · semilla: 7 · escritura simulada: 1 ms

Verdad de referencia: **1500 contactos únicos** y **2317 solicitudes únicas** (persona + servicio + día).

| Procesador | Contactos | Solicitudes | Duplicados bloqueados | Contactos de más | Solicitudes de más | Envíos/s | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|---|---|---|
| Con bloqueo (Sheet) | 1500 | 2317 | 1263 | 0 | 0 | 834 | 238.2 | 248.1 |
| Ingenuo (sin bloqueo) | 1619 | 2399 | 1510 | 119 | 82 | 41240 | 4.5 | 7.3 |

Resultado: **CORRECTO**: con bloqueo, 0 duplicados y todos los datos coinciden con la verdad.
Registro del procesador con bloqueo: {"creado":2317,"duplicado":1263,"reintento":354,"invalido":197}.

## Qué prueba y qué no
- Prueba la lógica anti-duplicados (normalización, idempotencia, clave por persona + servicio + día) y por qué hace falta un bloqueo: sin él, bajo concurrencia aparecen contactos y solicitudes repetidos.
- **No mide la capacidad real** de Google Sheets, de Apps Script ni del hosting. El tiempo de escritura es simulado. La capacidad real se mide con una prueba de carga contra el sistema desplegado.
