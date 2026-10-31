import Link from "next/link";
import Script from "next/script";
import { ActivarDialog } from "@/components/ActivarDialog";
import { Faq, Proceso } from "@/components/Confianza";
import { Instagram } from "@/components/Instagram";
import { LoopVideo } from "@/components/LoopVideo";
import { Personaje } from "@/components/Personaje";
import { Reveal } from "@/components/Reveal";
import { ServiceGrid } from "@/components/ServiceGrid";

const MARQUEE = ["Chatbot", "CRM", "Leads", "Sheets", "Videojuegos", "Personaje 3D", "Integraciones", "Automatización"];

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
            <a href="#servicios">Servicios</a>
            <a href="#proceso">Cómo trabajamos</a>
            <a href="#personaje">Personaje 3D</a>
            <a href="#videos">Videos</a>
            <a href="#preguntas">Preguntas</a>
          </div>
          <div className="nav-act">
            <a className="btn" href="#servicios" data-activar="">
              <span className="lg">Activar un servicio</span>
              <span className="sm">Activar</span>
            </a>
            <button type="button" className="burger" id="burger" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú">
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className="menu" id="menu" hidden>
          <div className="w">
            <a href="#servicios">Servicios</a>
            <a href="#proceso">Cómo trabajamos</a>
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
              Automatiza tu negocio.
              <br />
              <em>Conecta</em> cada cliente.
            </h1>
            <p className="lead">
              Chatbot, CRM y captación de leads que trabajan solos, más base de datos, videojuegos y personajes 3D para
              que tu marca se vea distinta.
            </p>
            <div className="cta">
              <a className="btn" href="#servicios">Ver servicios</a>
              <a className="btn ghost" href="#videos">Ver cómo funciona</a>
            </div>
          </div>
          <div className="hero-media">
            <LoopVideo base="/videos/hero_loop" poster="/videos/posters/hero_loop.webp" label="Tri, la mascota de THREE3, atendiendo a un cliente" />
          </div>
          <div className="proof">
            <div><b>8</b>servicios en 1 clic</div>
            <div><b>24/7</b>funcionando</div>
            <div><b>PEN · USD</b>pago local</div>
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

      <div className="w">
        <section id="servicios">
          <Reveal className="sh">
            <div>
              <span className="mono">Catálogo</span>
              <h2 style={{ marginTop: 10 }}>Todo lo que tu negocio necesita</h2>
            </div>
            <p>Cada servicio muestra qué incluye, qué necesitamos de ti y cuánto demora, antes de pagar.</p>
          </Reveal>
          <div className="chips" role="group" aria-label="Filtrar servicios">
            <button type="button" data-filtro="todos" aria-pressed="true">Todos</button>
            <button type="button" data-filtro="automatizacion" aria-pressed="false">Automatización</button>
            <button type="button" data-filtro="creativo" aria-pressed="false">Creativos</button>
          </div>
          <p className="sr" role="status" id="filtro-estado" />
          <ServiceGrid />
        </section>
      </div>

      <Proceso />

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
          <h2 style={{ marginTop: 12 }}>Tu negocio, automatizado y conectado</h2>
          <div className="cta" style={{ justifyContent: "center" }}>
            <a className="btn" href="#servicios" data-activar="">Activar un servicio</a>
            <a className="btn ghost" href="#videos">Ver cómo funciona</a>
          </div>
        </div>
      </section>

      </main>

      <div className="w">
        <footer>
          <span>© 2026 THREE3. Todos los derechos reservados.</span>
          <span>
            <Link href="/legal#datos">Privacidad</Link> · <Link href="/legal#reclamos">Libro de Reclamaciones</Link> ·{" "}
            <Link href="/legal#autor">Propiedad intelectual</Link> · <Link href="/legal">Información legal</Link>
          </span>
        </footer>
      </div>
      <div className="sticky-cta" id="sticky" hidden>
        <a className="btn" href="#servicios" data-activar="">Activar un servicio</a>
      </div>
      <ActivarDialog />
      <Script src="/activar.js" strategy="afterInteractive" />
      <Script src="/ui.js" strategy="afterInteractive" />
      {process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
    </>
  );
}
