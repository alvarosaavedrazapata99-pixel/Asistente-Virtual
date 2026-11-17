# Estrategia: ¿bot, fidelización o ambos? (noviembre 2026)

Documento de decisión. Reúne el análisis de 8 revisiones independientes (mercado, POS, SUNAT, hardware, Meta, arquitectura, dinero y validación). Marca con **[V]** lo que salió de una fuente y con **[I]** lo que es inferencia. Varias fuentes oficiales (SUNAT, Meta) no pudieron abrirse desde la sesión de trabajo: **todo lo oficial debe confirmarse antes de decidir dinero.**

## 1. Decisión recomendada
**Opción C: el bot paga las cuentas y la fidelización se valida a mano.**
- Seguir vendiendo el bot (plan Inicial) como producto principal.
- En paralelo, probar la fidelización por WhatsApp **sin programar** con 3 cafeterías durante 3 semanas.
- **No** construir impresora, integración con POS, lectura de boletas ni base maestra hasta cumplir los umbrales de la sección 5.

Por qué: [I] con una sola persona, sin clientes y sin RUC, lo que más riesgo quita es conseguir los primeros pagos; la fidelización pide 30 a 100 clientes para llegar a S/ 3,000 al mes, el bot entre 5 y 9.

### El gancho: 3 clientes gratuitos
Meta: conseguir **al menos 3 clientes gratuitos** (idealmente 3 cafeterías u otro rubro único). Si el servicio les gusta y lo usan, pasan al plan de pago; esos casos sirven además como testimonio para vender a los demás.
Condiciones para que el gancho valide y no solo regale trabajo:
1. **Gratis con fecha:** 6 semanas, no «para siempre». El precio se les muestra en la semana 4 y se cobra desde la semana 7.
2. **Acuerdo escrito corto** (una hoja): qué reciben, qué dan a cambio (15 minutos de feedback semanal, testimonio, uso de datos agregados con su permiso) y el precio al que pasarían. Un precio «fundador» congelado 12 meses es el incentivo para convertirse.
3. **Que usen el servicio sin que tú los empujes.** Si no lo usan en 2 semanas, no es validación aunque digan que les gusta.
4. **Mismo producto en los 3** (el bot o la fidelización, no mezclados), para que la comparación valga.
5. **Tope de esfuerzo** por cliente gratuito (unas pocas horas a la semana) para no dejar de buscar clientes de pago.
6. **Conversión esperada:** al menos 2 de 3 aceptan pagar. Con menos de eso, se cambia la oferta o el rubro.

## 2. Las tres ofertas en números (supuestos [I], verificar)
| Oferta | Precio mensual | Margen aprox. por cliente | Clientes para S/ 3,000 | Para S/ 10,000 |
|---|---|---|---|---|
| A. Bot Inicial | S/ 450 | ~S/ 425 | 7 | 23 |
| A. Bot (mezcla de planes) | ~S/ 700 | ~S/ 670 | 5 | 15 |
| B. Fidelización a S/ 56 (US$ 15) | S/ 56 | ~S/ 29 | ~100 reales | ~180+ |
| B. Fidelización a S/ 99 | S/ 99 | ~S/ 72 | 31 | 101 |
| C. Fidelización + dispositivo en comodato | S/ 129 | ~S/ 94 | 24 | 78 |

- El costo de mensajes de WhatsApp se come casi la mitad del precio en B a S/ 56. Hay que incluir un tope de mensajes o cobrar excedentes.
- Un dispositivo (~S/ 545 con instalación y merma) tarda ~6 a 8 meses en amortizarse; 78 clientes exigirían ~S/ 42,000 en equipos.
- Con 10% de rotación mensual, C casi no deja ganancia.

## 3. Hallazgos por tema
**Mercado.** [V] Existen sellos digitales internacionales (Loopy Loyalty, Stamp Me, Loyalzoo, Flok) desde US$ 19–50 al mes y, en Argentina, Tienda de Puntos (sin app, +1,000 comercios). [I] No apareció ningún proveedor peruano de sellos por WhatsApp con precios en soles: puede ser hueco real o límite de la búsqueda. Cafeterías y comida rápida tienen la recompra más clara, también más competencia; kioscos y bodegas, menos competencia pero poca disposición a pagar.

**POS y pagos.** [V] Mercado Pago y Culqi publican webhooks; el tercero necesita credenciales o autorización del comercio. [I] Niubiz e Izipay: no se encontró acceso para terceros, probablemente piden convenio comercial (meses, incierto). [V/I] Los pagos no traen teléfono ni identidad del cliente: **una venta sin teléfono no se puede premiar ni recontactar**. La identidad hay que capturarla con un QR o código en caja.

**SUNAT.** [V, resumen] Se reporta que desde el 1/6/2026 todos los contribuyentes deben emitir comprobantes electrónicos (RS 000075-2026/SUNAT). [I] Si es así, la idea de «comercios con solo boleta física» pierde base y lo más sólido sería leer el comprobante electrónico vía el PSE/OSE del comercio, con autorización escrita. **Pendiente: contador debe confirmar el texto de la resolución.** Vender hardware agrega IGV y comprobantes; el comodato se trata como servicio.

**Hardware.** [V] Impresora térmica 58 mm: S/ 70–260. [I] La impresora no es lo difícil: sin integrarse al sistema de ventas del comercio, alguien tiene que digitar cada venta, así que «no hacer nada» no se cumple. Alternativa sin hardware: QR fijo en el mostrador o código que el cajero muestra.

**WhatsApp (Meta).** [V, un agregador] Plantillas en Perú: marketing ~US$ 0.084, utilidad y autenticación ~US$ 0.024; otras fuentes dan US$ 0.03–0.07 para marketing. [I] 300 clientes con 4 mensajes al mes: ~US$ 29 a 101 al mes según la mezcla. Un aviso de «te falta 1 sello» puede clasificarse como marketing. [V] Existe un modo de coexistencia (misma línea en la app y en la API) con tope de 20 mensajes por segundo; **disponibilidad en Perú sin verificar**. Hace falta opt-in documentado y forma de darse de baja. [I] Modelo recomendado: cada comercio con su propia cuenta de Meta (Embedded Signup) y pagando directo, la agencia cobra su servicio aparte.

**Datos personales.** [I] Ley 29733 y su reglamento: consentimiento específico por finalidad, aviso de privacidad y posible registro del banco de datos. El comercio es responsable y THREE3 encargado: hace falta contrato de encargo. Revisar con abogado.

## 4. Qué se reutiliza del código actual
- Webhook de Meta con firma, límites, Supabase, panel admin, registro de interesados sin duplicados (patrón copiable para «cliente por celular»), correo de avisos, `scripts/qr.js` y el modelo de varios clientes del widget.
- **Brecha principal:** el bot de Meta hoy es de un solo negocio. Para varios comercios hay que resolver el comercio por `phone_number_id`, guardar token y número por comercio, y separar los límites por comercio.
- Para sellos, el cerebro debe ser **determinista** (comandos SELLO, SALDO, CANJEAR), no IA.
- **Estimación de un MVP técnico** (sin OCR ni POS): ~22 a 26 días hábiles, optimista si Meta demora. Esquema propuesto: comercios, programas, tiendas, dispositivos, clientes_finales, membresías, transacciones (libro de solo inserción), códigos de sello de un solo uso, recompensas y canjes, con índices únicos para evitar duplicados.
- Riesgos técnicos: el KV de Cloudflare no es atómico (no sirve para controlar sellos), el panel usa un solo `ADMIN_TOKEN`, y falta aislamiento por comercio.

## 5. Plan de las próximas semanas
**Semana 1.** Entrevistar a 10 dueños de cafeterías de un mismo distrito; elegir 1 local; definir la regla (por ejemplo 8 sellos = café gratis); imprimir un cartel con QR que abre WhatsApp con «SELLO»; hoja de cálculo con Clientes, Visitas y Canjes.
**Semana 2.** Operación en vivo: el cliente escribe «SELLO» tras comprar, se registra y se le responde su saldo. Mensaje de reactivación a quien lleva 10 días sin venir.
**Semana 3.** Primeros canjes, reporte semanal de una página al dueño, entrevista de 15 minutos, decidir qué automatizar.
En paralelo, en la misma semana: iniciar el RUC y la verificación de Meta (son la ruta crítica de ambos productos) y usar el diagnóstico gratis como gancho con los primeros 20 negocios.

**Oferta a los clientes gratuitos (los 3 de arriba).** Instalación en 48 horas, 6 semanas gratis (máximo 3 locales), a cambio de 15 minutos de feedback semanal, un cartel con QR en caja, permiso de testimonio y que su personal registre los sellos. Al final de la semana 4 se presenta el precio (S/ 49–99 al mes) y se cobra desde la semana 7 con compromiso escrito.

**Umbrales para decidir (fin de semana 3, corte en la 6):**
- Uso: 40% o más de los clientes de caja pide sello, o 15+ registrados en la semana 1 y 30+ en la 3, y el personal registra sin recordatorio.
- Recompra: 25% o más de los registrados vuelve 2 o más veces en 3 semanas.
- Pago: 2 de 3 dueños aceptan pagar S/ 49 o más, idealmente con un primer pago real.
- **Seguir** si cumple las tres. **Cambiar** (rubro, oferta o segmento) si hay uso sin pago o recompra sin uso. **Parar** si hay menos de 15% de uso y 0 de 5 dispuestos a pagar tras 2 rubros.

## 6. Lo que se deja para después
Impresora o dispositivo, integración con POS (Niubiz, Izipay, Culqi, Mercado Pago), lectura de boletas por foto (OCR) y base maestra por tienda. Solo se retoman si: el escaneo en caja funciona con 3 a 5 locales, hay fraude demostrado del QR fijo, un comercio ya tiene un POS integrable, y el cliente paga lo suficiente para recuperar el equipo en menos de 6 a 9 meses.

## 7. Cosas por verificar (con costo cero)
1. Contador: texto de la RS 075-2026 y excepciones; régimen y códigos de actividad del RUC; IGV de hardware o comodato.
2. Meta: tarifas oficiales por categoría y país, coexistencia en Perú y requisitos de verificación.
3. Abogado: contrato de encargo de datos, consentimiento y registro del banco de datos.
4. Llamar a 10 negocios: cuánto pagarían realmente y qué usan hoy.
5. Buscar competidores peruanos que no aparecieron.

## 8. Errores típicos a evitar
1. Construir tecnología antes de que 3 locales usen la versión manual.
2. Confundir «me interesa» con «pago»: sin cobro o compromiso escrito no hay validación.
3. Dispersarse en rubros: un rubro, una zona y 3 locales antes de ampliar.
