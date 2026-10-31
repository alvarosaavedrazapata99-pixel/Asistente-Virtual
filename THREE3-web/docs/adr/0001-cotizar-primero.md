# ADR 0001: Validar precios con Cotizar antes de activar pagos

- **Estado:** Propuesto (espera tu aprobación)
- **Fecha:** 2026-10-31

## Contexto
Los precios del archivo oficial son hipótesis alineadas con rangos de agencias; no hay cotizaciones cerradas. Activar pagos y facturación antes de validar es el riesgo comercial más barato de evitar.

## Decisión
Mantener `publicar:false` (la web muestra Cotizar y abre el formulario Activar). Activar pagos (Fase 4) solo cuando haya 3 cotizaciones cerradas y precios confirmados.

## Consecuencias
+ Se vende en semanas y se aprende qué compran. − Nadie paga en 1 clic hasta la Fase 4.
