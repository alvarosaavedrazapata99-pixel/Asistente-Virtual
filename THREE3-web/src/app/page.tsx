import Link from "next/link";
import Script from "next/script";
import { ActivarDialog } from "@/components/ActivarDialog";
import { AgendarBtn } from "@/components/AgendarBtn";
import { Despues, Faq, Proceso } from "@/components/Confianza";
import { Instagram } from "@/components/Instagram";
import { LoopVideo } from "@/components/LoopVideo";
import { Personaje } from "@/components/Personaje";
import { Reveal } from "@/components/Reveal";
import { Planes } from "@/components/Planes";

const MARQUEE = ["Bot con IA", "WhatsApp", "Leads", "CRM", "Reportes", "Seguimiento", "Personaje 3D", "Videojuegos"];

const MURO = [
  { id: "conecta", t: "Así se conecta", d: "Del comentario en Instagram a la venta registrada" },
  { id: "personaje", t: "Tri nace en Blender", d: "Del boceto al render de un personaje 3D" },
  { id: "juego", t: "Crea tu videojuego", d: "Un juego propio para tu marca" },
  { id: "idiomas", t: "Tri habla tu idioma", d: "Mensajes en varios idiomas para clientes de toda la región" },
];

export default function Home() {
  return (
    <>
      <nav aria-label="Principal">
        <div className="w nav-in">
          <a className="brand" href="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src="/assets/logo.webp" width={34} height={34} />
            THREE3
          </a>
          <div className="links">
            <a href="#planes">Planes</a>
            <a href="#proceso">Cómo trabajamos</a>
            <a href="#despues">Después de tu bot</a>
            <a href="#videos">Videos</a>
            <a href="#preguntas">Preguntas</a>
          </div>
          <div className="nav-act">
            <AgendarBtn evento="nav" corto="Agendar" />
            <button type="button" className="burger" id="burger" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú">
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className="menu" id="menu" hidden>
          <div className="w">
            <a href="#planes">Planes</a>
            <a href="#proceso">Cómo trabajamos</a>
            <a href="#despues">Después de tu bot</a>
            <a href="#personaje">Tu personaje 3D</a>
            <a href="#videos">Videos</a>
            <a href="#instagram">Instagram</a>
            <a href="#preguntas">Preguntas frecuentes</a>
            <Link href="/legal">Información legal</Link>
          </div>
        </div>
      </nav>

      <main>
      <div className="w">
        <header className="hero" id="top">
          <div className="hero-copy">
            <h1>
              Un bot con IA que atiende
              <br />
              a tus clientes <em>por ti</em>.
            </h1>
            <p className="lead">
              Respondemos consultas, registramos cada interesado y te damos reportes. Empiezas con un diagnóstico gratis de 20 a 30 minutos.
            </p>
            <div className="cta">
              <AgendarBtn evento="hero" />
              <a className="btn ghost" href="#planes">Ver planes</a>
            </div>
          </div>
          <div className="hero-media">
            <LoopVideo base="/videos/hero_loop" poster="/videos/posters/hero_loop.webp" label="Tri, la mascota de THREE3, atendiendo a un cliente" />
          </div>
          <div className="proof">
            <div><b>Gratis</b>diagnóstico de 20 a 30 min</div>
            <div><b>S/ 2,000</b>pago inicial desde</div>
            <div><b>Incluido</b>cuidado mensual</div>
          </div>
        </header>
      </div>

      <div className="mq" aria-hidden="true">
        <div>
          {[...MARQUEE, ...MARQUEE].map((x, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span>{x}</span>
              <span style={{ color: "var(--cy)" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      <Planes />

      <Proceso />

      <Despues />

      <Personaje />

      <section id="videos">
        <div className="w">
          <Reveal className="sh">
            <div>
              <span className="mono">Hecho por nosotros</span>
              <h2 style={{ marginTop: 10 }}>Mira cómo funciona</h2>
            </div>
            <p>Animaciones hechas para la web que muestran cada paso. Se reproducen solas cuando llegan a la pantalla.</p>
          </Reveal>
          <Reveal className="vw2">
            {MURO.map((m) => (
              <figure className="vf" key={m.id}>
                <div className="vid">
                  <LoopVideo base={`/videos/svc_${m.id}`} poster={`/videos/posters/svc_${m.id}.webp`} label={m.t} />
                </div>
                <figcaption>
                  <b>{m.t}</b>
                  <span>{m.d}</span>
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </div>
      </section>

      <Instagram />

      <Faq />

      <section className="final" id="final">
        <div className="w">
          <span className="mono">Empieza hoy</span>
          <h2 style={{ marginTop: 12 }}>Hablemos de tu negocio</h2>
          <div className="cta" style={{ justifyContent: "center" }}>
            <AgendarBtn evento="final" />
            <a className="btn ghost" href="#planes">Ver planes</a>
          </div>
        </div>
      </section>

      </main>

      <div className="w">
        <footer>
          <span>© 2026 THREE3. Todos los derechos reservados.</span>
          <span>
            <Link href="/legal#privacidad">Privacidad</Link> · <Link href="/legal#terminos">Términos</Link> ·{" "}
            <Link href="/legal#consumidor">Consumidor</Link> · <Link href="/legal">Información legal</Link>
          </span>
        </footer>
      </div>
      <div className="sticky-cta" id="sticky" hidden>
        <AgendarBtn evento="sticky" />
      </div>
      <ActivarDialog />
      <Script src="/activar.js" strategy="afterInteractive" />
      <Script src="/ui.js" strategy="afterInteractive" />
      {process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
    </>
  );
}
