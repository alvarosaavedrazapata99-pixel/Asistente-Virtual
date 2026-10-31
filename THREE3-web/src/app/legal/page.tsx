import type { Metadata } from "next";
import Link from "next/link";
import empresa from "@/config/empresa.config.json";
import s from "./legal.module.css";

const dato = (v: string, marcador = "[COMPLETAR]") => v.trim() || marcador;

export const metadata: Metadata = {
  title: "Información legal · THREE3",
  description: "Marca, derechos de autor, datos personales, Libro de Reclamaciones, inteligencia artificial y facturación.",
};

const FUENTES: [string, string][] = [
  ["https://modelo.pe/blog/como-registrar-una-marca-en-indecopi-peru-2026/", "Registro de marca en INDECOPI (modelo.pe)"],
  ["https://modelo.pe/blog/derechos-de-autor-como-registrar-tu-obra/", "Derechos de autor y registro de obras (modelo.pe)"],
  ["https://lexlatin.com/reportajes/proteccion-datos-personales-peru-empresas-oficial-cumplimiento-reforma", "Reforma de protección de datos personales (LexLatin)"],
  ["https://elperuano.pe/noticia/282787-plataformas-de-comercio-electronico-deberan-contar-con-libro-de-reclamaciones", "Libro de Reclamaciones en plataformas de comercio electrónico (El Peruano)"],
  ["https://elperuano.pe/noticia/304529-inteligencia-artificial-conoce-las-obligaciones-que-ya-son-exigibles-a-empresas-de-sectores-priorizados", "Obligaciones de la ley de inteligencia artificial (El Peruano)"],
];

export default function Legal() {
  return (
    <div className={s.page}>
      <main>
        <p className={s.top}><Link href="/">← Volver al sitio</Link></p>
        <h1>THREE3 · Información legal y propiedad intelectual</h1>
        <p className={s.meta}>
          Texto de referencia, versión borrador. Actualizado al 30 de octubre de 2026. Los datos entre corchetes
          [COMPLETAR] deben llenarse antes de publicar.
        </p>

        <div className={s.idx}>
          <ol>
            <li><a href="#marca">Marca registrada y signos distintivos</a></li>
            <li><a href="#autor">Derechos de autor y licencias</a></li>
            <li><a href="#datos">Protección de datos personales</a></li>
            <li><a href="#reclamos">Libro de Reclamaciones y protección al consumidor</a></li>
            <li><a href="#ia">Uso de inteligencia artificial</a></li>
            <li><a href="#fact">Facturación y datos del proveedor</a></li>
            <li><a href="#fuentes">Fuentes consultadas</a></li>
          </ol>
        </div>

        <h2 id="marca">1. Marca registrada y signos distintivos</h2>
        <p>THREE3, el logotipo árbol-circuito y el personaje Tri son signos distintivos de {dato(empresa.razon_social, "[RAZÓN SOCIAL / TITULAR]")}. Su registro ante la Dirección de Signos Distintivos del INDECOPI se encuentra por iniciar [COMPLETAR].</p>
        <p>Datos de referencia del trámite de registro de marca en el Perú:</p>
        <ul>
          <li>Tasa: S/ 534,90 por la primera clase y S/ 533,30 por cada clase adicional. La primera clase tiene una tasa reducida de S/ 401,20 para titulares inscritos en el ReMYPE con RUC activo y habido.</li>
          <li>Plazo: el plazo legal es de 180 días hábiles. Terceros pueden presentar oposición durante 30 días hábiles desde la publicación.</li>
          <li>Vigencia: diez años renovables. La protección alcanza únicamente al territorio peruano.</li>
          <li>Clases por evaluar con asesoría legal: 9 (software), 35 (publicidad y gestión de negocios), 41 (entretenimiento y animación) y 42 (servicios tecnológicos). Para cuatro clases, el costo estimado es de S/ 2 135 sin descuentos.</li>
        </ul>

        <h2 id="autor">2. Derechos de autor y licencias</h2>
        <p>Los contenidos de este sitio (textos, diseños, videos, animaciones, personajes, código y modelos 3D) son obras protegidas por el Decreto Legislativo N.º 822, Ley sobre el Derecho de Autor. © 2026 THREE3. Todos los derechos reservados. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización escrita del titular.</p>
        <ul>
          <li>El derecho de autor nace con la creación de la obra. El registro en el INDECOPI es opcional y constituye prueba oficial de autoría y de fecha cierta.</li>
          <li>Los derechos morales son inalienables e irrenunciables. Los derechos patrimoniales pueden cederse o licenciarse.</li>
          <li>El diseño del logotipo, los videos y el software pueden protegerse como obras. La marca que identifica un negocio es una protección distinta y se registra por separado.</li>
        </ul>
        <h3>Licencias de entrega a clientes</h3>
        <p>Cada servicio entregado (personaje 3D, video, videojuego u otro recurso) incluye una licencia escrita que indica su alcance: licencia comercial estándar, licencia exclusiva o cesión de derechos patrimoniales. El cliente declara que el material que aporta es suyo o cuenta con permiso para usarlo. No se aceptan encargos que incluyan personajes, marcas, música, fuentes u otros contenidos de terceros sin autorización. [COMPLETAR plantillas de licencia con un abogado].</p>

        <h2 id="datos">3. Protección de datos personales</h2>
        <p>El tratamiento de datos personales se rige por la Ley N.º 29733, Ley de Protección de Datos Personales, y su nuevo reglamento, vigente desde el 31 de marzo de 2025.</p>
        <ul>
          <li>El consentimiento debe ser previo, libre, expreso, inequívoco e informado. No se utilizan casillas premarcadas ni consentimientos agrupados.</li>
          <li>Los incidentes que afecten datos personales se notifican en un plazo de 48 horas desde que se toma conocimiento, a la autoridad y, cuando corresponda, a los titulares afectados.</li>
          <li>El oficial de datos personales se exige de forma escalonada según el tamaño de la empresa: pequeñas empresas, noviembre de 2027; microempresas, noviembre de 2028; salvo que se traten datos sensibles o grandes volúmenes de datos.</li>
          <li>Las infracciones pueden sancionarse con multas de hasta 100 UIT. Registrar y actualizar los bancos de datos es una de las obligaciones más frecuentemente incumplidas.</li>
          <li>Los titulares pueden ejercer sus derechos de acceso, rectificación, cancelación y oposición escribiendo a {dato(empresa.correo, "[CORREO DE CONTACTO]")}.</li>
        </ul>
        <p>Los mensajes comerciales de seguimiento requieren consentimiento previo. El INDECOPI puede sancionar con multas de hasta 450 UIT las comunicaciones comerciales no solicitadas.</p>

        <h2 id="reclamos">4. Libro de Reclamaciones y protección al consumidor</h2>
        <p>La Ley N.º 32495, publicada el 11 de noviembre de 2025, modifica los artículos 150 y 151 del Código de Protección y Defensa del Consumidor (Ley N.º 29571). Establece que las plataformas digitales de comercio electrónico deben contar con Libro de Reclamaciones, físico o virtual, y exhibir de forma permanente, en un lugar visible y de fácil acceso, el enlace a dicho libro.</p>
        <p>El formato y los plazos de atención dependen de la adecuación del reglamento vigente (Decreto Supremo N.º 011-2011-PCM) [VERIFICAR antes de publicar]. Enlace al Libro de Reclamaciones virtual: [COMPLETAR].</p>
        <p>El precio, la moneda, el alcance y las condiciones de cada servicio se informan de manera clara antes del pago [COMPLETAR con asesoría legal]. Las políticas de privacidad, términos y condiciones, y reembolsos se publican en esta sección una vez revisadas por un abogado.</p>

        <h2 id="ia">5. Uso de inteligencia artificial</h2>
        <p>La Ley N.º 31814 y su reglamento exigen informar al usuario, en lenguaje claro, el propósito y las principales funciones de un sistema de inteligencia artificial, y contar con mecanismos visibles que indiquen cuándo un contenido o servicio es generado u operado con esta tecnología. Los sistemas de alto riesgo requieren supervisión humana efectiva y registros de transparencia. Los sectores priorizados son salud, educación, justicia, seguridad, economía y finanzas; los demás se incorporan de forma gradual, hasta en un máximo de cuatro años.</p>
        <p>Los asistentes virtuales (chatbots) de THREE3 se identifican como tales dentro de la conversación. Los videojuegos y demás entregables pasan por revisión humana antes de su entrega.</p>

        <h2 id="fact">6. Facturación y datos del proveedor</h2>
        <p>Razón social: {dato(empresa.razon_social)}. RUC: {dato(empresa.ruc)}. Domicilio: {dato(empresa.domicilio)}. Correo de contacto: {dato(empresa.correo)}. Los comprobantes de pago se emiten de forma electrónica mediante un facturador autorizado por la SUNAT.</p>

        <h2 id="fuentes">7. Fuentes consultadas</h2>
        <ul>
          {FUENTES.map(([href, t]) => (
            <li key={href}><a href={href} target="_blank" rel="noopener noreferrer">{t}</a></li>
          ))}
        </ul>
        <p className={s.aviso}>Este documento es informativo y no constituye asesoría legal. Las cifras y los plazos pueden cambiar; confírmalos en las fuentes oficiales del INDECOPI y con un abogado antes de pagar o publicar.</p>

        <p className={s.pie}>© 2026 THREE3. Todos los derechos reservados. <Link href="/">Volver al sitio</Link></p>
      </main>
    </div>
  );
}
