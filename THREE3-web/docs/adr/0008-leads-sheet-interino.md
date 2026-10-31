# ADR 0008: El Sheet maestro es la vista de trabajo; la base de datos será Postgres

- **Estado:** Propuesto (necesita tu OK)
- **Fecha:** 2026-10-31

## Contexto
Se pidió un Sheet maestro sin duplicados, automatizable, que reciba los leads de la web, Instagram y anuncios, y que aguante mucha gente a la vez. Un Sheet con Apps Script escribe de una en una (con bloqueo) y tiene cuotas de Google; no está pensado como base de datos de alta concurrencia.

## Decisión
1. **Ahora:** el formulario envía a un Apps Script que escribe en el Sheet con la lógica anti-duplicados probada (`scripts/leads/core.js`). Sirve para los primeros leads y para validar el proceso.
2. **Cuando haya tráfico (Fase 3 del v4):** los leads entran a Postgres (Supabase) con índices únicos (`email_norm`, `celular_norm`, `contacto+servicio+día`, `idempotency_key`) y el Sheet se alimenta por sincronización cada minuto. La lógica `core.js` se reutiliza igual.

## Consecuencias
- + Se prueba el flujo real esta semana. + Cero duplicados verificado con 4,131 envíos de 200 bots a la vez (`docs/simulacro-leads.md`).
- − Con tráfico alto el Sheet puede saturarse; por eso el paso 2.
- − Requiere pegar el script y publicarlo como aplicación web (pasos en `docs/sheets/README.md`).
