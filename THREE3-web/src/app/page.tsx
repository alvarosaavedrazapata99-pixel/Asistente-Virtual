import Link from "next/link";
import Script from "next/script";
import { ActivarDialog } from "@/components/ActivarDialog";
import { AgendarBtn } from "@/components/AgendarBtn";
import { Despues, Faq, Proceso } from "@/components/Confianza";
import { Demo } from "@/components/Demo";
import { Instagram } from "@/components/Instagram";
import { LoopVideo } from "@/components/LoopVideo";
import { Personaje } from "@/components/Personaje";
import { Reveal } from "@/components/Reveal";
import { Planes } from "@/components/Planes";
import { PRECIOS_BAJO_CLIC } from "@/lib/planes";

const MARQUEE = ["Bot con IA", "WhatsApp", "Leads", "CRM", "Reportes", "Seguimiento", "Personaje 3D", "Videojuegos"];

/** Menú: cada sección tiene un video corto (versión liviana) que se ve al pasar el cursor o al abrir el menú en el celular. */
const MENU = [
  { href: "#demo", t: "Pruébalo", d: "Chatea con un bot de ejemplo", v: "svc_chatbot", escritorio: true },
  { href: "#planes", t: "Planes", d: "Elige cómo empezar", v: "svc_sheets", escritorio: true },
  { href: "#proceso", t: "Cómo trabajamos", d: "Cinco pasos, sin sorpresas", v: "svc_conecta", escritorio: true },
  { href: "#despues", t: "Después de tu bot", d: "Reportes, CRM y más canales", v: "svc_crm", escritorio: true },
  { href: "#personaje", t: "Personaje 3D", d: "Del boceto al render", v: "svc_personaje", escritorio: false },
  { href: "#videos", t: "Videos", d: "Mira cómo funciona", v: "svc_juego", escritorio: true },
  { href: "#preguntas", t: "Preguntas", d: "Antes de decidir", v: "svc_idiomas", escritorio: true },
];

const MURO = [
  { id: "conecta", t: "Así se conecta", d: "Del comentario en Instagram a la venta registrada",
    x: ["Un cliente comenta una palabra clave en tu publicación o te escribe por mensaje directo.", "El bot le responde al instante, le hace unas preguntas y registra su nombre, celular y qué busca.", "Tú recibes el aviso y el interesado queda ordenado en tu CRM, con su nivel de interés, listo para que lo atiendas o para el seguimiento automático."] },
  { id: "personaje", t: "Tri nace en Blender", d: "Del boceto al render de un personaje 3D",
    x: ["Empezamos con un briefing: concepto, estilo y usos del personaje, sin marcas ni personajes de terceros.", "Dibujamos un boceto en blanco y negro para que apruebes la forma antes de modelar.", "Modelamos, texturizamos y renderizamos en Blender. Entregamos archivos listos para redes, web o video, con licencia escrita."] },
  { id: "juego", t: "Crea tu videojuego", d: "Un juego propio para tu marca",
    x: ["Un juego corto con tu marca o tu personaje, pensado para que la gente juegue, comparta y regrese.", "Se define la mecánica, el arte y dónde se jugará (web o celular).", "El alcance, el plazo y el precio se cotizan por escrito según lo que necesites."] },
  { id: "idiomas", t: "Tri habla tu idioma", d: "Mensajes en varios idiomas para clientes de toda la región",
    x: ["Tu bot puede atender en español y en otros idiomas según tu plan.", "Detecta el idioma del cliente y responde en el mismo, con la información de tu negocio.", "Útil para turismo, comercio exterior y negocios con clientes de varios países."] },
];

export default function Home() {
  return (
    <>
      <div className="progreso" aria-hidden="true" />
      <nav aria-label="Principal">
        <div className="navprev" id="navprev" hidden aria-hidden="true">
          <video muted loop playsInline preload="none" />
          <p />
        </div>
        <div className="w nav-in">
          <a className="brand" href="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src="/assets/logo.webp" width={34} height={34} />
            THREE3
          </a>
          <div className="links">
            {MENU.filter((m) => m.escritorio).map((m) => (
              <a key={m.href} href={m.href} data-prev={m.v} data-desc={m.d}>{m.t}</a>
            ))}
          </div>
          <div className="nav-act">
            <AgendarBtn evento="nav" corto="Diagnóstico" />
            <button type="button" className="burger" id="burger" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú">
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className="menu" id="menu" hidden>
          <div className="w">
            {MENU.map((m, i) => (
              <a key={m.href} href={m.href} className="mi" style={{ "--i": i } as React.CSSProperties}>
                <video className="mthumb" muted loop playsInline preload="none" data-v={m.v} aria-hidden="true" tabIndex={-1} />
                <span><b>{m.t}</b><small>{m.d}</small></span>
              </a>
            ))}
            <a href="#instagram" className="mi mi-s" style={{ "--i": MENU.length } as React.CSSProperties}><span><b>Instagram</b></span></a>
            <Link href="/legal" className="mi mi-s" style={{ "--i": MENU.length + 1 } as React.CSSProperties}><span><b>Información legal</b></span></Link>
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
              Respondemos consultas, registramos cada interesado y te damos reportes. Empiezas con un diagnóstico automático gratis de 3 minutos.
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
            <div><b>Gratis</b>diagnóstico en 3 min</div>
            {PRECIOS_BAJO_CLIC ? <div><b>Por escrito</b>propuesta antes de pagar</div> : <div><b>S/ 2,000</b>pago inicial desde</div>}
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

      <Demo />

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
                <button type="button" className="vid vbtn" data-vm={`vm-${m.id}`} aria-haspopup="dialog" aria-label={`Abrir: ${m.t}`}>
                  <LoopVideo base={`/videos/svc_${m.id}`} poster={`/videos/posters/svc_${m.id}.webp`} label={m.t} />
                  <span className="vmas">Ver más</span>
                </button>
                <figcaption>
                  <b>{m.t}</b>
                  <span>{m.d}</span>
                </figcaption>
              </figure>
            ))}
          </Reveal>
          {MURO.map((m) => (
            <dialog key={m.id} id={`vm-${m.id}`} className="vmodal" aria-label={m.t}>
              <button type="button" className="vcerrar" data-vcerrar aria-label="Cerrar">×</button>
              <div className="vm-v">
                <LoopVideo base={`/videos/svc_${m.id}`} poster={`/videos/posters/svc_${m.id}.webp`} label={m.t} />
              </div>
              <div className="vm-t">
                <h3>{m.t}</h3>
                <ol>
                  {m.x.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
                <AgendarBtn evento={`video:${m.id}`} />
              </div>
            </dialog>
          ))}
          <Reveal className="incluye-mes aliada">
            <b>Producción audiovisual con agencia aliada</b>
            <p className="nota-precio">Además del bot, trabajamos junto a una agencia aliada de contenido audiovisual: videos para redes, anuncios, presentaciones de tu negocio y piezas animadas. Se cotiza aparte, según lo que necesites.</p>
            <AgendarBtn className="btn ghost" texto="Cotizar contenido audiovisual" evento="video:audiovisual" />
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
      {/* Bot propio de THREE3: solo aparece cuando el cliente "three3" existe y está activo en la base */}
      <Script src="/widget.js" data-cliente="three3" strategy="afterInteractive" />
      <Script src="/activar.js" strategy="afterInteractive" />
      <Script src="/ui.js" strategy="afterInteractive" />
      {process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
    </>
  );
}
