# ADR 0002: Arquitectura A: Next.js + Supabase + Inngest + worker, Cloudflare en el borde

- **Estado:** Propuesto (espera tu aprobación)
- **Fecha:** 2026-10-31

## Contexto
Dos alternativas comparadas en `00-analisis.md`. El mayor riesgo es la seguridad de pedidos y pagos.

## Decisión
Adoptar A: Next.js en Vercel, Supabase (Postgres con RLS, Auth, Storage), Inngest para colas, worker en contenedor para Blender y sandbox de juegos, Cloudflare para DNS, WAF, Turnstile, Stream y R2.

## Consecuencias
+ RLS mueve la autorización a la base. + Postgres real para analítica. − Varios proveedores y más secretos. − Costo de Vercel crece con tráfico (revisar en un ADR si supera el margen). Requiere cuentas de Supabase, Vercel y Cloudflare.
