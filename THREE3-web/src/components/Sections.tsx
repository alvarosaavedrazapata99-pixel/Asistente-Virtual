import Link from "next/link";
import { INSTAGRAM_DM, INSTAGRAM_URL, servicios } from "@/lib/services";
import { CircuitBg } from "./CircuitBg";
import { Poster } from "./Poster";
import { ServiceCard } from "./ServiceCard";
import { Tri } from "./Tri";
import { VideoLoop } from "./VideoLoop";
import { CharacterCompare } from "./CharacterCompare";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-cyan/10 bg-night/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#inicio" className="font-display text-2xl tracking-wider">
          THREE<span className="text-orange">3</span>
        </a>
        <nav aria-label="Principal" className="hidden gap-6 text-sm text-cream/80 md:flex">
          <a href="#servicios" className="hover:text-cyan">Servicios</a>
          <a href="#como-funciona" className="hover:text-cyan">Cómo funciona</a>
          <a href="#personaje" className="hover:text-cyan">Personaje 3D</a>
          <a href="#instagram" className="hover:text-cyan">Instagram</a>
        </nav>
        <a href={INSTAGRAM_DM} className="rounded-full bg-orange px-4 py-2 text-sm font-semibold text-night hover:brightness-110">
          Cotizar
        </a>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section id="inicio" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <VideoLoop poster={<Poster />} label="Fondo animado de THREE3" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/60 to-night" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-20 md:grid-cols-[1.4fr_1fr] md:py-28">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-cyan">Automatización para negocios</p>
          <h1 className="font-display text-5xl uppercase leading-[1.02] md:text-7xl">
            Automatiza tu negocio. <span className="text-cyan">Conecta cada cliente.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-cream/80">
            Del mensaje en Instagram a la venta registrada: chatbot, CRM y seguimiento de clientes, listos para usar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#servicios" className="rounded-full bg-orange px-6 py-3 font-semibold text-night transition hover:brightness-110">
              Ver servicios
            </a>
            <a href={INSTAGRAM_DM} className="rounded-full border border-cream/30 px-6 py-3 text-cream/90 hover:border-cyan">
              Escríbenos por Instagram
            </a>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <Tri size={220} className="drop-shadow-[0_0_40px_rgba(34,211,238,.35)]" />
        </div>
      </div>
    </section>
  );
}

export function Servicios() {
  return (
    <section id="servicios" className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="font-display text-4xl uppercase md:text-5xl">Servicios</h2>
      <p className="mt-3 max-w-2xl text-cream/75">
        Elige lo que necesitas hoy y suma más después. Los precios se confirman según el alcance de tu negocio.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {servicios.map((s) => (
          <ServiceCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  );
}

const pasos = ["Instagram", "Chatbot", "Lead", "CRM", "Venta"];

const muro = [
  { id: "conecta", titulo: "Conecta", texto: "Instagram → chatbot → lead → CRM → venta.", marcas: pasos },
  { id: "personaje", titulo: "Personaje 3D", texto: "De la idea al turntable.", marcas: ["Boceto", "Modelado", "Render"] },
  { id: "juego", titulo: "Videojuego", texto: "Tu juego web, jugable.", marcas: ["Brief", "Prototipo", "Entrega"] },
  { id: "idiomas", titulo: "Idiomas", texto: "Tri atiende en varios idiomas.", marcas: ["ES", "EN", "PT"] },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="relative border-y border-cyan/10 bg-panel/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl uppercase md:text-5xl">Mira cómo funciona</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {muro.map((m) => (
            <figure key={m.id} className="overflow-hidden rounded-2xl border border-cyan/15 bg-panel">
              <div className="relative aspect-video">
                <VideoLoop poster={<Poster etiqueta={m.titulo} />} label={`Video: ${m.titulo}`} />
              </div>
              <figcaption className="space-y-3 p-5">
                <p className="text-cream/80">{m.texto}</p>
                <ol className="flex flex-wrap gap-2" aria-label="Pasos">
                  {m.marcas.map((x, i) => (
                    <li key={x} className="rounded-full border border-cyan/40 px-3 py-1 font-mono text-xs text-cyan">
                      {i + 1} · {x}
                    </li>
                  ))}
                </ol>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Personaje() {
  return (
    <section id="personaje" className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-orange">Servicio adicional</p>
          <h2 className="font-display text-4xl uppercase md:text-5xl">Tu personaje 3D</h2>
          <p className="mt-4 text-cream/80">
            Una mascota original estilo juguete 3D para tu marca: boceto aprobado por ti, modelado y render en Blender,
            con licencia clara de uso.
          </p>
          <ol className="mt-6 space-y-2 font-mono text-sm text-cream/80">
            <li>1 · Briefing</li>
            <li>2 · Boceto en blanco y negro</li>
            <li>3 · Modelado y render</li>
            <li>4 · Entrega y licencia</li>
          </ol>
          <a href={INSTAGRAM_DM} className="mt-8 inline-block rounded-full bg-orange px-6 py-3 font-semibold text-night hover:brightness-110">
            Cotizar mi personaje
          </a>
        </div>
        <CharacterCompare />
      </div>
    </section>
  );
}

export function Instagram() {
  return (
    <section id="instagram" className="border-t border-cyan/10 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl uppercase md:text-5xl">Lo último de THREE3</h2>
        <p className="mt-3 text-cream/75">Casos y novedades en Instagram. Los posts reales se enlazarán en una fase posterior.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-cyan/15">
              <Poster etiqueta="Ejemplo ilustrativo" />
            </div>
          ))}
        </div>
        <a href={INSTAGRAM_URL} className="mt-8 inline-block rounded-full border border-cyan/50 px-6 py-3 font-semibold text-cyan hover:bg-cyan hover:text-night">
          Seguir @three_3agency
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-cyan/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-cream/70">
        <p>© 2026 THREE3. Todos los derechos reservados.</p>
        <Link href="/legal" className="underline underline-offset-4 hover:text-cyan">
          Información legal
        </Link>
      </div>
    </footer>
  );
}

export { CircuitBg };
