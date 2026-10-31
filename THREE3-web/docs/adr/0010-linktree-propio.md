# ADR 0010: Página de enlaces propia (`/ig`) en lugar de un servicio externo

- **Estado:** Aceptado
- **Fecha:** 2026-10-31

## Contexto
Se propuso un Linktree. Un servicio externo se pone en marcha en minutos, pero no abre el formulario con el servicio elegido, no conecta con el Sheet maestro y deja los datos de clics en su plataforma. Los límites exactos de sus planes **[VALIDAR]**.

## Decisión
Usar una página propia: `/ig` y `/ig/<campaña>`, editables desde `ig.config.json`, con etiquetas UTM por campaña y medición anónima de visitas y clics que se guarda en el Sheet.

## Consecuencias
+ Un toque lleva al formulario con el servicio elegido. + Atribución por campaña dentro de nuestro Sheet. + Marca y datos propios, sin costo.
− Hay que mantenerla nosotros. − La medición necesita el endpoint de Apps Script desplegado.
