import type { Metadata } from "next";
import Link from "next/link";
import empresa from "@/config/empresa.config.json";
import planes from "@/config/planes.config.json";
import s from "./legal.module.css";

const dato = (v: string, marcador = "[COMPLETAR]") => v.trim() || marcador;
const ACLARACION = planes.aclaracion;

export const metadata: Metadata = {
  title: "Información legal · THREE3",
  description: "Política de privacidad, términos del servicio y política de consumidor de THREE3.",
};

export default function Legal() {
  const correo = dato(empresa.correo, "[CORREO DE CONTACTO]");
  return (
    <div className={`${s.page} legal-plain`}>
      <main>
        <p className={s.top}><Link href="/">← Volver al sitio</Link></p>
        <h1>THREE3 · Información legal</h1>
        <p className={s.meta}>
          Texto de referencia, versión borrador. Actualizado en noviembre de 2026. Los datos entre corchetes
          [COMPLETAR] deben llenarse y revisarse con un abogado antes de publicar.
        </p>

        <div className={s.idx}>
          <ol>
            <li><a href="#privacidad">Política de privacidad</a></li>
            <li><a href="#terminos">Términos del servicio</a></li>
            <li><a href="#consumidor">Política de consumidor</a></li>
            <li><a href="#derechos">Derechos reservados</a></li>
            <li><a href="#proveedor">Datos del proveedor</a></li>
          </ol>
        </div>

        <h2 id="privacidad">1. Política de privacidad</h2>
        <p>El tratamiento de datos personales se rige por la Ley N.º 29733, Ley de Protección de Datos Personales, y su reglamento. El titular del banco de datos es {dato(empresa.razon_social, "[RAZÓN SOCIAL / TITULAR]")}.</p>
        <h3>Qué datos recogemos</h3>
        <p>Los que escribes en el formulario o en el chat: nombre, nombre de tu negocio (opcional), correo o celular, y el detalle de lo que necesitas. No pedimos datos sensibles.</p>
        <h3>Para qué los usamos</h3>
        <p>Solo para responder tu solicitud y coordinar tu diagnóstico gratis. No los vendemos ni los usamos para otros fines sin pedirte antes tu consentimiento.</p>
        <h3>Consentimiento</h3>
        <p>Antes de enviar el formulario debes marcar una casilla, que no viene premarcada, para autorizar el uso de tus datos. Puedes retirar tu consentimiento en cualquier momento.</p>
        <h3>Cuánto tiempo los conservamos</h3>
        <p>[COMPLETAR plazo de conservación con un abogado]. Pasado ese plazo, o si lo pides, los eliminamos.</p>
        <h3>Con quién los compartimos</h3>
        <p>Con los proveedores técnicos necesarios para operar el servicio (alojamiento web, base de datos y mensajería) [COMPLETAR lista final de proveedores]. Los pagos con Mercado Pago los procesa Mercado Pago; THREE3 no guarda datos de tu tarjeta.</p>
        <h3>Tus derechos</h3>
        <p>Puedes pedir acceso, rectificación, cancelación y oposición (derechos ARCO) escribiendo a {correo}. Si consideras que no atendimos tu pedido, puedes acudir a la Autoridad Nacional de Protección de Datos Personales.</p>
        <h3>Seguridad</h3>
        <p>La web usa HTTPS, el formulario tiene protección contra spam y no se envían datos personales en la dirección (URL) de la página. Si ocurre un incidente que afecte tus datos, lo comunicaremos como exige la normativa.</p>
        <h3>Medición anónima</h3>
        <p>Nuestras páginas de enlaces miden visitas y clics de forma anónima, sin cookies ni datos que te identifiquen.</p>

        <h2 id="terminos">2. Términos del servicio</h2>
        <ul>
          <li>El diagnóstico es gratis, dura entre 20 y 30 minutos y no te obliga a contratar.</li>
          <li>Después del diagnóstico recibes una propuesta escrita con alcance, plazo y precio. El servicio empieza cuando aceptas esa propuesta.</li>
          <li>Los precios del sitio están en soles (S/) y son «desde». El precio final es el de la propuesta aceptada.</li>
          <li>Cada plan tiene un pago inicial y una mensualidad. La mensualidad incluye plataforma, IA, vigilancia, copias de seguridad, horas de mejora y un reporte.</li>
          <li>{ACLARACION}</li>
          <li>Los pagos en línea se procesan con Mercado Pago. Mientras no se anuncie lo contrario, funcionan solo en modo de prueba y no se cobra dinero real.</li>
          <li>Nuestros asistentes virtuales se identifican como inteligencia artificial dentro de la conversación (Ley N.º 31814). Los entregables pasan por revisión humana.</li>
          <li>Cada entrega incluye una licencia escrita con su alcance de uso. El cliente declara que el material que aporta es suyo o tiene permiso para usarlo.</li>
          <li>Plazos de cancelación, suspensión por falta de pago y responsabilidad: [COMPLETAR con un abogado].</li>
        </ul>

        <h2 id="consumidor">3. Política de consumidor</h2>
        <p>Informamos de forma clara el precio, la moneda, el alcance y las condiciones antes de que pagues, conforme al Código de Protección y Defensa del Consumidor (Ley N.º 29571).</p>
        <p>La Ley N.º 32495 exige que las plataformas digitales de comercio electrónico tengan Libro de Reclamaciones y muestren su enlace de forma visible. Enlace al Libro de Reclamaciones virtual: [COMPLETAR]. Formato y plazos: [VERIFICAR con un abogado antes de publicar].</p>
        <p>Reembolsos y devoluciones: [COMPLETAR con un abogado]. Para consultas o reclamos escribe a {correo}.</p>

        <h2 id="derechos">4. Derechos reservados</h2>
        <p>Los textos, diseños, videos, animaciones, personajes, código y modelos 3D de este sitio están protegidos por el Decreto Legislativo N.º 822, Ley sobre el Derecho de Autor. THREE3, su logotipo y el personaje Tri son signos distintivos de {dato(empresa.razon_social, "[RAZÓN SOCIAL / TITULAR]")}; su registro ante el INDECOPI está por iniciar [COMPLETAR].</p>
        <p>© 2026 THREE3. Todos los derechos reservados. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización escrita del titular.</p>

        <h2 id="proveedor">5. Datos del proveedor</h2>
        <p>Razón social: {dato(empresa.razon_social)}. RUC: {dato(empresa.ruc)}. Domicilio: {dato(empresa.domicilio)}. Correo de contacto: {correo}.</p>

        <p className={s.aviso}>Este documento es informativo y no constituye asesoría legal. Confírmalo con un abogado antes de publicar.</p>
        <p className={s.pie}>© 2026 THREE3. Todos los derechos reservados. <Link href="/">Volver al sitio</Link></p>
      </main>
    </div>
  );
}
