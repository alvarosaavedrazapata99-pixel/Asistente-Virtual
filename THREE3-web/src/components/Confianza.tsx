import Link from "next/link";
import { Reveal } from "./Reveal";

const PASOS = [
  { t: "Eliges y nos cuentas tu caso", d: "Pulsa Activar en el servicio que necesitas y llena un formulario corto. Sin pagar nada todavía." },
  { t: "Confirmamos alcance y precio", d: "Revisamos tu caso y te enviamos el alcance, el plazo y el precio final por escrito. Tú decides." },
  { t: "Construimos y te entregamos", d: "Una persona revisa cada entrega antes de que la recibas. Recibes también la licencia de uso." },
];

const FAQ = [
  { q: "¿Cuánto cuesta?", a: "Cada negocio es distinto, por eso confirmamos el precio por escrito antes de que pagues. Los montos que ves en el catálogo son de ejemplo." },
  { q: "¿El chatbot funciona en WhatsApp de inmediato?", a: "No siempre. WhatsApp Business exige una verificación de Meta y tiene costos propios. Te acompañamos en ese trámite y te avisamos en qué estado está." },
  { q: "¿Mis datos están seguros?", a: "Usamos tus datos solo para responder tu solicitud y los tratamos según la Ley N.º 29733. El detalle está en la página legal." },
  { q: "¿El chatbot dice que es una IA?", a: "Sí. Se identifica como asistente virtual dentro de la conversación, como pide la normativa peruana de inteligencia artificial." },
  { q: "¿Puedo pedir cambios al personaje 3D?", a: "Sí. Apruebas el boceto antes de modelar y la entrega incluye rondas de cambios. La cantidad exacta se confirma en tu cotización." },
  { q: "¿Qué licencia recibo?", a: "Cada entrega incluye una licencia escrita con su alcance de uso. Si necesitas exclusividad, se cotiza aparte." },
];

export function Proceso() {
  return (
    <section id="proceso">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Cómo trabajamos</span>
            <h2 style={{ marginTop: 10 }}>Tres pasos, sin sorpresas</h2>
          </div>
          <p>Sabes qué recibes, cuánto cuesta y cuándo llega antes de pagar.</p>
        </Reveal>
        <Reveal className="grid">
          {PASOS.map((p, i) => (
            <article className="card" key={p.t}>
              <span className="mono">Paso {i + 1}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </article>
          ))}
        </Reveal>
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
            ¿Algo más? Escríbenos por Instagram o revisa la <Link href="/legal" style={{ color: "var(--cy)" }}>información legal</Link>.
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
