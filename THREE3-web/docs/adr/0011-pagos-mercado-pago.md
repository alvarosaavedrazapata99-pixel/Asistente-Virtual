# ADR 0011: Pagos con Mercado Pago (Checkout Pro) como primer proveedor

- **Estado:** Aceptado para construir; se activa al validar precios (ADR 0001)
- **Fecha:** 2026-10-31

## Contexto
Se pidió cobrar de la forma más simple posible, con tarjetas y efectivo, y con seguridad. Mercado Pago Checkout Pro lleva al comprador a su página y lo devuelve a la nuestra: nuestros servidores nunca tocan datos de tarjeta. Yape y PagoEfectivo figuran entre sus métodos locales, pero cuáles quedan activos para tu cuenta se confirma en el panel de Mercado Pago **[VALIDAR]**. Niubiz y PagoEfectivo directo son alternativas con contrato y trámite propios.

## Decisión
1. **Mercado Pago Checkout Pro** primero. Un solo proveedor, una sola integración, menos trámite.
2. **El cobro nace de una orden creada por nosotros tras acordar la cotización.** El cliente recibe un enlace con un token de un solo propósito; **el monto sale del servidor, nunca del navegador**.
3. **La verdad del pago se consulta a Mercado Pago desde el servidor** al recibir el aviso, con firma verificada, idempotencia y comprobación de orden, monto y moneda.
4. **Interfaz de proveedor:** Niubiz o PagoEfectivo directo se agregan después sin tocar el resto, solo si la tasa de aprobación o la comisión lo justifican.

## Consecuencias
+ Cumple el alcance de seguridad de pago más ligero (la tarjeta nunca pasa por nosotros). + Código probado (18 pruebas de pagos, 5 de base de datos). − Requiere servidor: funciones de Cloudflare Pages + Supabase + cuentas con claves. − Comisiones por confirmar (blogs de terceros dan 3.5%–4.5% + IGV en tarjetas, sin acuerdo entre sí). − Mercado Pago pide RUC para cuentas de vendedor **[VALIDAR]**.
