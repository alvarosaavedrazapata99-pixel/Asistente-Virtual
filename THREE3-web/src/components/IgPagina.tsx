import Link from "next/link";
import Script from "next/script";
import empresa from "@/config/empresa.config.json";
import ig from "@/config/ig.config.json";
import { INSTAGRAM_DM, servicios } from "@/lib/services";

export type Campana = { slug: string; titulo: string; servicio: string };

const wa = empresa.whatsapp.replace(/\D/g, "");

/** Página del enlace de la biografía. Con `campana`, destaca otro servicio y usa su propia etiqueta UTM. */
export function IgPagina({ campana }: { campana?: Campana }) {
  const nombreCampana = campana ? `bio-${campana.slug}` : "link-bio";
  const utm = `utm_source=instagram&utm_medium=bio&utm_campaign=${nombreCampana}`;
  const idDestacado = campana?.servicio ?? (ig.destacado.activo ? ig.destacado.servicio : "");
  const destacado = servicios.find((s) => s.id === idDestacado);

  return (
    <main className="igp" data-endpoint={process.env.NEXT_PUBLIC_LEADS_ENDPOINT ?? ""} data-campana={nombreCampana} data-vista={campana ? `ig:${campana.slug}` : "ig"}>
      <header className="igp-h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/tri-render.webp" alt="Tri, la mascota de THREE3" width={96} height={144} />
        <h1>THREE3</h1>
        <p>{campana ? campana.titulo : "Automatiza tu negocio. Conecta cada cliente."}</p>
      </header>

      <nav aria-label="Enlaces" className="igp-l">
        {destacado && (
          <Link className="igp-feat" href={`/?activar=${destacado.id}&${utm}`} data-ev={`ig:destacado:${destacado.id}`}>
            <small>Destacado</small>
            <b>{destacado.nombre}</b>
            <span>{destacado.resumen}</span>
            <em className="btn">Pedir cotización</em>
          </Link>
        )}
        <Link className="btn igp-main" href={`/?${utm}#servicios`} data-ev="ig:todos">Ver todos los servicios</Link>
        <h2>Pide tu cotización</h2>
        {servicios.map((s) => (
          <Link key={s.id} className="btn ghost" href={`/?activar=${s.id}&${utm}`} data-ev={`ig:servicio:${s.id}`}>
            {s.nombre}
          </Link>
        ))}
        <h2>Habla con nosotros</h2>
        {wa && (
          <a className="btn ghost" data-ev="ig:whatsapp" href={`https://wa.me/${wa}?text=${encodeURIComponent("Hola THREE3, quiero cotizar un servicio.")}`} target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </a>
        )}
        <a className="btn ghost" data-ev="ig:instagram" href={INSTAGRAM_DM} target="_blank" rel="noopener noreferrer">Escribir por Instagram</a>
      </nav>

      <footer className="igp-f">
        <span>© 2026 THREE3. Todos los derechos reservados.</span>
        <Link href="/legal">Información legal</Link>
      </footer>
      <Script src="/eventos.js" strategy="afterInteractive" />
    </main>
  );
}
