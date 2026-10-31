# THREE3 — Análisis Fase 0

> Nota de método: los skills "Legends/genios" no están instalados en esta sesión. Este análisis usa criterio propio de marketing, ventas, diseño, seguridad y legal-tech. Todo lo marcado **[VALIDAR]** es hipótesis sin dato verificado; no hay cifras de mercado inventadas.

## 1. Público objetivo
| Segmento | Dolor | Cómo llega |
|---|---|---|
| **A. Pyme peruana con ventas por WhatsApp/Instagram** (tiendas, clínicas, academias, inmobiliarias) | Responden tarde, pierden leads, anotan en cuaderno o Excel | Instagram (@three_3agency), comentarios con palabra clave |
| **B. Emprendedor/marca personal** | Quiere mascota/personaje y presencia premium | Reels, turntables 3D |
| **C. Creador/estudio pequeño** | Quiere un juego a medida barato | Serie "Crea tu videojuego" |

**Prioridad: A.** Es el que paga recurrente y entiende el ROI. B y C son puertas de entrada y diferenciación visual, no el negocio central (coincide con tu nota del 30-oct: el personaje es un servicio más).

## 2. Propuesta de valor
"Automatiza tu negocio. Conecta cada cliente." Instagram → chatbot → lead → CRM → venta, ya armado, con precio visible y entrega en días, no meses. Diferenciador: **la marca (Tri) y el cuidado visual**, algo que las agencias de chatbots casi nunca tienen.

## 3. Competencia en LATAM (categorías; nombres por validar)
- **Plataformas de chatbot/CRM por suscripción** (tipo constructores no-code de WhatsApp): baratas, pero el cliente arma todo solo. Debilidad: curva de aprendizaje.
- **Agencias y freelancers locales de automatización**: precio variable, sin catálogo ni precio público, entrega artesanal. Debilidad: nada se compra en 1 clic.
- **Estudios 3D / freelancers de personajes**: buen arte, venden por cotización, sin proceso transparente ni licencia clara.
- **Brecha:** nadie combina catálogo con precio visible + marca fuerte + licencias claras. **[VALIDAR]** con 10 búsquedas reales y 3 cotizaciones antes de fijar precios.

## 4. Estructura que convierte (móvil primero, tráfico desde Instagram)
1. Hero: promesa en una línea + 1 CTA ("Ver servicios") + video loop sin audio.
2. Prueba de funcionamiento: "Mira cómo funciona" (conecta, personaje, juego, idiomas).
3. Catálogo de 6 servicios con "Ver precio / Activar" y precio "desde" o "Cotizar".
4. Cómo trabajamos (3 pasos) + qué necesitamos del cliente.
5. Tu personaje 3D (comparador boceto→render).
6. Instagram + WhatsApp. Pie mínimo con enlace a `/legal`.
Sin testimonios inventados: usar "Caso ilustrativo" hasta tener clientes reales.

## 5. Riesgos que veo
- **Alcance enorme** (pagos, panel, licencias PDF, sandbox de juegos). Vender primero con "Cotizar" + WhatsApp valida demanda antes de construir la automatización completa.
- **WhatsApp Business** exige verificación de Meta: no prometer activación instantánea.
- **Precios en `services.config.json`** son hipótesis: no publicar sin 3 cotizaciones.
- **Legal** (Ley 29733, 31814, Libro de Reclamaciones): borradores, revisión de abogado obligatoria.
- **Rendimiento:** muchos videos autoplay en móvil pesan; solo reproducir los visibles y cargar WebM ligero.

## 6. Tres decisiones clave (necesito tu respuesta)
1. **¿Vender en 1 clic desde el día 1, o primero "Cotizar" + WhatsApp?** Recomiendo cotizar primero: Fases 1–3 en semanas, pagos y entrega automática después, con demanda ya probada.
2. **Foco del hero: automatización para pymes (A), no el personaje.** Recomiendo A; el personaje 3D y los juegos como servicios secundarios.
3. **Video en producción: Cloudflare Stream/Mux (HLS) vs. archivos propios en el CDN.** Recomiendo archivos WebM/MP4 cortos propios ahora (clips de 5–6 s) y Stream/Mux solo para videos largos.
