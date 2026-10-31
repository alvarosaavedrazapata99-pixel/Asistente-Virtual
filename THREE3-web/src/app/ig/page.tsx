import type { Metadata } from "next";
import Link from "next/link";
import empresa from "@/config/empresa.config.json";
import { INSTAGRAM_DM, servicios } from "@/lib/services";

export const metadata: Metadata = { title: "THREE3 · Enlaces", description: "Elige un servicio de THREE3 y pide tu cotización." };

const UTM = "utm_source=instagram&utm_medium=bio&utm_campaign=link-bio";
const wa = empresa.whatsapp.replace(/\D/g, "");

/** Página para el enlace de la biografía de Instagram: un toque lleva al formulario con el servicio elegido. */
export default function Ig() {
  return (
    <main className="igp">
      <header className="igp-h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/tri-render.webp" alt="Tri, la mascota de THREE3" width={96} height={144} />
        <h1>THREE3</h1>
        <p>Automatiza tu negocio. Conecta cada cliente.</p>
      </header>

      <nav aria-label="Enlaces" className="igp-l">
        <Link className="btn igp-main" href={`/?${UTM}#servicios`}>Ver todos los servicios</Link>
        <h2>Pide tu cotización</h2>
        {servicios.map((s) => (
          <Link key={s.id} className="btn ghost" href={`/?activar=${s.id}&${UTM}`}>
            {s.nombre}
          </Link>
        ))}
        <h2>Habla con nosotros</h2>
        {wa && (
          <a className="btn ghost" href={`https://wa.me/${wa}?text=${encodeURIComponent("Hola THREE3, quiero cotizar un servicio.")}`} target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </a>
        )}
        <a className="btn ghost" href={INSTAGRAM_DM} target="_blank" rel="noopener noreferrer">Escribir por Instagram</a>
      </nav>

      <footer className="igp-f">
        <span>© 2026 THREE3. Todos los derechos reservados.</span>
        <Link href="/legal">Información legal</Link>
      </footer>
    </main>
  );
}
