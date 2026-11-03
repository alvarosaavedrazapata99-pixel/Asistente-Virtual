import Link from "next/link";
import { ACLARACION } from "@/lib/planes";
import { AgendarBtn } from "./AgendarBtn";
import { Reveal } from "./Reveal";

const PASOS = [
  { t: "Diagnóstico gratis", d: "Hablamos de 20 a 30 minutos para entender tu negocio, tus consultas y lo que quieres lograr. No cuesta nada." },
  { t: "Propuesta", d: "Te enviamos por escrito el alcance, el plazo y el precio. Tú decides si seguimos." },
  { t: "Implementación", d: "Construimos y configuramos tu bot con la información de tu negocio." },
  { t: "Puesta en marcha", d: "Lo activamos contigo, probamos juntos y revisamos que responda como esperas." },
  { t: "Cuidado mensual", d: "Plataforma, IA, vigilancia, copias de seguridad, horas de mejora y un reporte cada mes." },
];

const DESPUES = [
  { t: "Reportes", d: "Mira cuántas consultas llegan, qué preguntan y cuáles terminan en venta." },
  { t: "Leads y CRM", d: "Cada interesado queda registrado y con su seguimiento." },
  { t: "Seguimiento automático", d: "Recordatorios y mensajes a tiempo, siempre con el permiso del cliente." },
  { t: "Más canales", d: "Suma Instagram, tu web u otros canales a tu bot." },
  { t: "Web", d: "Una página profesional conectada a tu bot." },
  { t: "Capacitación", d: "Tu equipo aprende a usar el bot y a mejorarlo." },
];

const FAQ = [
  { q: "¿Cuánto cuesta?", a: "Los precios están en soles y son desde: pago inicial más mensualidad. El valor final lo recibes por escrito en la propuesta, después del diagnóstico gratis." },
  { q: "¿Qué incluye la mensualidad?", a: "Plataforma, IA, vigilancia, copias de seguridad, horas de mejora y un reporte." },
  { q: "¿Quién paga los mensajes de WhatsApp, el dominio y el hosting?", a: ACLARACION + " Te explicamos cada costo en la propuesta." },
  { q: "¿El bot funciona en WhatsApp de inmediato?", a: "No siempre. WhatsApp Business exige una verificación de Meta. Te acompañamos en ese trámite y te avisamos en qué estado está." },
  { q: "¿Mis datos están seguros?", a: "Usamos tus datos solo para responder tu solicitud y los tratamos según la Ley N.º 29733. El detalle está en la política de privacidad." },
  { q: "¿El bot dice que es una IA?", a: "Sí. Se identifica como asistente virtual dentro de la conversación, como pide la normativa peruana." },
  { q: "¿Qué licencia recibo en un personaje 3D?", a: "Cada entrega incluye una licencia escrita con su alcance de uso. Si necesitas exclusividad, se cotiza aparte." },
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
        <Reveal className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
