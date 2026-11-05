import Link from "next/link";
import { ACLARACION } from "@/lib/planes";
import { AgendarBtn } from "./AgendarBtn";
import { LoopVideo } from "./LoopVideo";
import { Reveal } from "./Reveal";

export const PASOS = [
  { t: "Diagnóstico gratis", d: "Respondes unas preguntas sobre tu negocio (unos 3 minutos) y recibes al instante tu diagnóstico. Si quieres, lo revisamos juntos en una llamada corta. No cuesta nada." },
  { t: "Propuesta", d: "Te enviamos por escrito el alcance, el plazo y el precio. Tú decides si seguimos." },
  { t: "Implementación", d: "Construimos y configuramos tu bot con la información de tu negocio." },
  { t: "Puesta en marcha", d: "Lo activamos contigo, probamos juntos y revisamos que responda como esperas." },
  { t: "Cuidado mensual", d: "Plataforma, IA, vigilancia, copias de seguridad, horas de mejora y un reporte cada mes." },
];

export const DESPUES = [
  { t: "Reportes", d: "Mira cuántas consultas llegan, qué preguntan y cuáles terminan en venta." },
  { t: "Leads y CRM", d: "Cada interesado queda registrado y con su seguimiento." },
  { t: "Seguimiento automático", d: "Recordatorios y mensajes a tiempo, siempre con el permiso del cliente." },
  { t: "Más canales", d: "Suma Instagram, tu web u otros canales a tu bot." },
  { t: "Web", d: "Una página profesional conectada a tu bot." },
  { t: "Capacitación", d: "Tu equipo aprende a usar el bot y a mejorarlo." },
];

const FAQ: { t: string; items: { q: string; a: string }[] }[] = [
  { t: "Sobre el servicio", items: [
    { q: "¿Qué hace exactamente el bot?", a: "Responde por ti las preguntas que más te hacen (precios, horarios, ubicación, servicios), registra a cada interesado con su nombre y celular, y te avisa cuando alguien quiere comprar o reservar. Según el plan, también hace seguimiento y te entrega reportes." },
    { q: "¿Cómo funciona el diagnóstico gratis?", a: "Eliges tu rubro, respondes unas preguntas (unos 3 minutos) y ves al instante tu diagnóstico: cuánto de tu atención está automatizada, cuántas consultas podrías estar dejando pasar y por dónde empezar. Te enviamos una copia por correo. Si quieres, después lo conversamos con una persona." },
    { q: "¿Por qué crecería mi negocio con un bot?", a: "Porque responde al instante, a cualquier hora, y no se pierde ningún interesado. Muchos clientes compran donde les responden primero. Además te ahorra las horas que hoy gastas contestando lo mismo." },
    { q: "¿Cuánto demora en estar listo?", a: "Depende del plan y de tus canales. Te damos la fecha por escrito en la propuesta, antes de que pagues. Si usas WhatsApp, cuenta además el tiempo de verificación de Meta." },
    { q: "¿El bot responde cosas que no sabe o se inventa respuestas?", a: "Lo configuramos con la información de tu negocio. Cuando no sabe algo, lo dice y te deriva a una persona, y cada mes corregimos lo que falló." },
    { q: "¿Puedo hablar con una persona del equipo?", a: "Sí. En cualquier momento puedes escribirnos o pedir que te llamemos; el diagnóstico es automático, pero la propuesta la ve una persona." },
  ] },
  { t: "Precios y pagos", items: [
    { q: "¿Cuánto cuesta?", a: "Los precios están en soles y son desde: pago inicial más mensualidad. El valor final lo recibes por escrito en la propuesta, después del diagnóstico gratis." },
    { q: "¿Por qué hay una mensualidad?", a: "Porque un bot no se instala y se olvida: cada mes lo mejoramos con tus conversaciones reales, lo vigilamos, hacemos copias de seguridad, actualizamos precios y textos y adaptamos los cambios de Meta. Incluye también la IA y la plataforma." },
    { q: "¿Quién paga los mensajes de WhatsApp, el dominio y el hosting?", a: ACLARACION + " Si prefieres, nosotros los compramos y gestionamos por ti. Te explicamos cada costo en la propuesta." },
    { q: "¿Puedo cambiar de plan más adelante?", a: "Sí. Puedes empezar con el Inicial y sumar el módulo de leads y CRM o pasar a otro plan cuando tu negocio lo pida." },
    { q: "¿Hay contrato o permanencia?", a: "Las condiciones quedan por escrito en la propuesta, antes de pagar. Los términos generales están en la información legal." },
    { q: "¿Cómo se paga?", a: "Se acuerda en la propuesta. Los pagos en línea con tarjeta están en preparación y se activan cuando los aprobemos." },
  ] },
  { t: "Página web y canales", items: [
    { q: "¿También crean páginas web?", a: "Sí. Creamos tu página web profesional y la conectamos al bot: diseño, textos, formulario protegido contra spam, certificado de seguridad y publicación en tu dominio. Se cotiza según lo que necesites." },
    { q: "¿Qué pasa si no tengo dominio ni hosting?", a: "Te ayudamos a elegirlos y, si quieres, los compramos y gestionamos por ti. Su costo lo cobra el proveedor y va aparte de nuestros planes." },
    { q: "¿El bot funciona en WhatsApp de inmediato?", a: "No siempre. WhatsApp Business exige una verificación de Meta. Te acompañamos en ese trámite y te avisamos en qué estado está." },
    { q: "¿Funciona también en Instagram, Facebook o TikTok?", a: "Instagram y Facebook se conectan por Meta, igual que WhatsApp. TikTok tiene reglas propias y se evalúa caso por caso. Cuántos canales incluye cada plan está en la sección de planes." },
    { q: "¿Puedo ver cómo respondería antes de contratar?", a: "Sí: prueba la demo de esta página con el rubro más parecido al tuyo. Es un ejemplo, tu bot se arma con la información de tu negocio." },
    { q: "¿Qué licencia recibo en un personaje 3D?", a: "Cada entrega incluye una licencia escrita con su alcance de uso. Si necesitas exclusividad, se cotiza aparte." },
  ] },
  { t: "Seguridad y legal", items: [
    { q: "¿Mis datos están seguros?", a: "Usamos tus datos solo para responder tu solicitud y los tratamos según la Ley N.º 29733. La conexión es cifrada y la información se guarda con copias de seguridad. El detalle está en la política de privacidad." },
    { q: "¿Quién es dueño de la información de mis clientes?", a: "Tú. Los datos de tus interesados son de tu negocio; nosotros los tratamos para operar el servicio." },
    { q: "¿El bot dice que es una IA?", a: "Sí. Se identifica como asistente virtual dentro de la conversación, como pide la normativa peruana." },
    { q: "¿Emiten comprobante de pago?", a: "Sí, con los datos de la empresa. El detalle se confirma en la propuesta." },
    { q: "¿Qué pasa si quiero dejar el servicio?", a: "Puedes cancelar según lo que quede escrito en la propuesta. Te entregamos tu información de interesados." },
    { q: "¿Dónde veo los términos y la privacidad?", a: "En la información legal de esta página: privacidad, términos y derechos del consumidor." },
  ] },
];

export function Proceso() {
  return (
    <section id="proceso">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Cómo trabajamos</span>
            <h2 style={{ marginTop: 10 }}>Cinco pasos, sin sorpresas</h2>
          </div>
          <p>Sabes qué recibes, cuánto cuesta y cuándo llega antes de pagar.</p>
        </Reveal>
        <Reveal>
          <ol className="steps5">
            {PASOS.map((p) => (
              <li key={p.t}>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

export function Despues() {
  return (
    <section id="despues">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Después de tu bot</span>
            <h2 style={{ marginTop: 10 }}>Tu negocio sigue creciendo</h2>
          </div>
          <p>Cuando tu bot ya trabaja, puedes sumar estos servicios, uno a la vez.</p>
        </Reveal>
        <Reveal className="after">
          {DESPUES.map((d) => (
            <article key={d.t}>
              <h3>{d.t}</h3>
              <p>{d.d}</p>
            </article>
          ))}
        </Reveal>
        <div className="cta-centro">
          <AgendarBtn evento="despues" />
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="preguntas">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Preguntas frecuentes</span>
            <h2 style={{ marginTop: 10 }}>Antes de decidir</h2>
          </div>
          <p>
            ¿Algo más? Escríbenos o revisa la <Link href="/legal" style={{ color: "var(--cy)" }}>información legal</Link>.
          </p>
        </Reveal>
        <div className="faq-torres">
          {FAQ.map((g) => (
            <Reveal className="faq" key={g.t}>
              <h3 className="faq-gt">{g.t}</h3>
              {g.items.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
