import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { AgendarBtn } from "@/components/AgendarBtn";
import { DESPUES, PASOS } from "@/components/Confianza";
import { ACLARACION, mensualidadIncluye, planes, soles } from "@/lib/planes";

export const metadata: Metadata = { title: "THREE3 · Presentación", robots: { index: false, follow: false }, referrer: "no-referrer" };

const FLUJO = [
  { t: "Tu cliente escribe", d: "Por WhatsApp o Instagram, a cualquier hora." },
  { t: "El bot responde", d: "Con la información de tu negocio, identificándose como asistente virtual." },
  { t: "Queda registrado", d: "Cada interesado con su contacto, listo para seguimiento." },
  { t: "Tú cierras la venta", d: "El bot te pasa a la persona cuando hace falta una conversación real." },
];

/** Presentación para clientes. Versión general; con datos de la solicitud (guardados solo en la pestaña, nunca en la dirección) se personaliza. */
export default function Presentacion() {
  return (
    <main className="deck" id="deck">
      <header className="deck-top">
        <Link href="/" className="brand">THREE3</Link>
        <span className="deck-cnt" id="deck-cnt" aria-live="polite">1 / 8</span>
        <button type="button" className="btn ghost" id="deck-print">Guardar PDF</button>
      </header>

      <section className="slide" data-slide>
        <span className="mono">Presentación</span>
        <h1>Un bot con IA que atiende a tus clientes <em>por ti</em></h1>
        <p className="lead" id="deck-para">Cómo THREE3 puede ayudar a tu negocio.</p>
      </section>

      <section className="slide" data-slide>
        <span className="mono">El problema</span>
        <h2>Cada consulta sin respuesta a tiempo es un cliente que se va</h2>
        <ul className="deck-list">
          <li>Escriben fuera de horario y nadie contesta hasta el día siguiente.</li>
          <li>Preguntan lo mismo muchas veces y tu tiempo se va en repetir respuestas.</li>
          <li>Los interesados no quedan anotados y el seguimiento se olvida.</li>
        </ul>
      </section>

      <section className="slide" id="deck-contaste" data-slide hidden>
        <span className="mono">Lo que nos contaste</span>
        <h2 id="deck-contaste-t">Tu situación</h2>
        <blockquote id="deck-detalle" />
        <p className="mute">Lo revisamos juntos en el diagnóstico gratis.</p>
      </section>

      <section className="slide" data-slide>
        <span className="mono">La solución</span>
        <h2>Un asistente que atiende, registra y te avisa</h2>
        <ul className="deck-list">
          <li>Responde las consultas frecuentes con la información de tu negocio.</li>
          <li>Registra cada interesado: nombre, contacto y qué necesita.</li>
          <li>Te pasa a una persona cuando hace falta una conversación real.</li>
          <li>Te entrega un reporte para que veas qué está pasando.</li>
        </ul>
      </section>

      <section className="slide" data-slide>
        <span className="mono">Cómo funciona</span>
        <h2>De la consulta a la venta, sin perder a nadie</h2>
        <ol className="steps5 deck-flujo">
          {FLUJO.map((f) => (
            <li key={f.t}><h3>{f.t}</h3><p>{f.d}</p></li>
          ))}
        </ol>
      </section>

      <section className="slide" data-slide>
        <span className="mono">Planes</span>
        <h2 id="deck-plan-t">Elige cómo empezar</h2>
        <div className="plans deck-planes">
          {planes.map((p) => (
            <article key={p.id} className={`plan${p.destacado ? " hot" : ""}`} data-plan={p.id}>
              <span className="etq" data-reco hidden>Recomendado para ti</span>
              <h3>{p.modulo ? p.nombre : `Plan ${p.nombre}`}</h3>
              <p className="resumen">{p.resumen}</p>
              <div className="precio">
                <small>Desde</small>
                <b>{soles(p.inicial)} <span>pago inicial</span></b>
                <span className="mes">+ {soles(p.mensual)} al mes</span>
              </div>
            </article>
          ))}
        </div>
        <p className="mute">La mensualidad incluye: {mensualidadIncluye.join(", ").toLowerCase()}. {ACLARACION} El precio final se confirma por escrito después del diagnóstico.</p>
      </section>

      <section className="slide" data-slide>
        <span className="mono">Cómo trabajamos</span>
        <h2>Cinco pasos, sin sorpresas</h2>
        <ol className="steps5">
          {PASOS.map((p) => (
            <li key={p.t}><h3>{p.t}</h3><p>{p.d}</p></li>
          ))}
        </ol>
      </section>

      <section className="slide" data-slide>
        <span className="mono">Después de tu bot</span>
        <h2>Tu negocio sigue creciendo</h2>
        <div className="after">
          {DESPUES.map((d) => (
            <article key={d.t}><h3>{d.t}</h3><p>{d.d}</p></article>
          ))}
        </div>
      </section>

      <section className="slide" data-slide>
        <span className="mono">Siguiente paso</span>
        <h2>Haz tu diagnóstico gratis</h2>
        <p className="lead">Responde unas preguntas (3 minutos) y recibe al instante tu diagnóstico. Después, si quieres, recibes una propuesta por escrito y tú decides.</p>
        <div className="cta"><AgendarBtn evento="presentacion" /></div>
      </section>

      <nav className="deck-nav" aria-label="Diapositivas">
        <button type="button" className="btn ghost" id="deck-prev" aria-label="Anterior">←</button>
        <button type="button" className="btn ghost" id="deck-next" aria-label="Siguiente">→</button>
      </nav>
      <Script src="/presentacion.js" strategy="afterInteractive" />
    </main>
  );
}
