# ADR 0006: Formulario Activar sin servidor (solución interina)

- **Estado:** Aceptado como interino
- **Fecha:** 2026-10-31

## Contexto
No hay base de datos ni cuenta de Supabase. Aun así el botón Activar debe llevar a una acción real.

## Decisión
Formulario validado con consentimiento no premarcado que arma la solicitud para copiar y enviar por Instagram. Se reemplaza por guardado en `leads` + aviso en la Fase 3 del v4.

## Consecuencias
+ Funciona hoy sin infraestructura. − Depende de que la persona pegue el mensaje; no hay registro propio de leads.
