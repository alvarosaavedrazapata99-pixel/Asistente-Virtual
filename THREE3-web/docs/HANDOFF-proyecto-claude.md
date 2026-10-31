# THREE3-web · Resumen para el Proyecto de Claude / Cowork (31-oct-2026)

Pega este documento (o conecta el repositorio) en el Proyecto "Tree Project" para que cualquier sesión retome sin contexto.

## Dónde está todo
- **Repositorio:** `alvarosaavedrazapata99-pixel/Asistente-Virtual`, rama **`three3-web-carga`**, carpeta **`THREE3-web/`**.
- **Enlace de revisión de la web** (artefacto privado): https://claude.ai/artifact/CLQScQh66UhvBtLBY34uXj
- **Simulador de leads:** https://claude.ai/artifact/Nsp4Aw9yADjojEXyZ2PYQJ
- **Simulación del enlace de Instagram:** https://claude.ai/artifact/6nkXMVqcPbdvrdkoU61rzN
- **Sheet maestro de leads:** https://docs.google.com/spreadsheets/d/1CVCtBeQYdoJSzY1ahOD1LhKQO_60LADnSoy-oyBjfXI/edit
- **Grilla de contenido de Instagram:** presentación "THREE3 · Grilla de contenido Instagram (Oct–Nov 2026)" en Drive.

## Qué es
Web profesional de THREE3 (automatización, CRM, chatbot, personaje 3D, videojuegos) que capta solicitudes de cotización. Next.js 16 + TypeScript, exportación estática, diseño oscuro con Tri (antena de 3 bolitas, siempre). Servicios y precios desde `src/config/services.config.json` (`publicar:false` = "Cotizar"). Formulario "Activar" con anti-duplicados, página de enlaces para Instagram (`/ig`, `/ig/<campaña>`), página legal `/legal` (borrador con [COMPLETAR]).

## Estado
Hecho: diseño y UX móvil/escritorio, 8 servicios, hero con video, formulario, Sheet maestro con control de duplicados, simulacros, `/ig` con medición anónima, documentación y 10 decisiones (`docs/decisiones.md`).
Pendiente (bloquea el lanzamiento): publicar en Cloudflare Pages, comprar dominio (`three3agency.com`), conectar el formulario al Sheet (Apps Script), datos de la empresa en `src/config/empresa.config.json`, WhatsApp, revisión legal, precios validados con 3 cotizaciones.

## Reglas de trabajo (de `CLAUDE.md`)
- Tras cada cambio visible: `scripts/enlace/build.sh`, probar con Playwright en móvil y escritorio, y republicar el MISMO artefacto de revisión.
- Tri siempre con 3 bolitas. WebM siempre `yuv420p`. Sin testimonios ni cifras inventadas. Todo ejemplo dice "ejemplo ilustrativo".
- No cobrar ni activar pagos antes de validar precios (ADR 0001).

## Dónde leer más (en `THREE3-web/docs/`)
`decisiones.md` y `adr/` · `00-analisis.md` · `01-flujos.md` · `03-auditoria-ux.md` · `05-review-senior.md` (críticas y recomendaciones) · `lanzamiento-instagram.md` · `despliegue.md` (costos) · `sheets/README.md`.

## Siguiente paso recomendado
1) Corregir las promesas del hero (ver review). 2) Publicar en Cloudflare Pages. 3) Conectar el Sheet. 4) Prueba desde Instagram. 5) Lanzamiento pequeño con 10–20 personas.
