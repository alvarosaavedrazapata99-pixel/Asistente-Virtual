import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgendarBtn } from "@/components/AgendarBtn";
import { LoopVideo } from "@/components/LoopVideo";
import { DETALLES, detallePorId } from "@/lib/detalles";

export const dynamicParams = false;
export function generateStaticParams() {
  return DETALLES.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const d = detallePorId((await params).id);
  return d ? { title: `${d.titulo} · THREE3`, description: d.lead } : {};
}

export default async function Detalle({ params }: { params: Promise<{ id: string }> }) {
  const d = detallePorId((await params).id);
  if (!d) notFound();
  const otros = DETALLES.filter((x) => x.id !== d.id);
  return (
    <main className="mas w">
      <nav className="mas-top" aria-label="Navegación">
        <Link href="/#videos" className="mas-volver">← Volver al camino principal</Link>
        <Link href="/" className="brand">THREE3</Link>
      </nav>
      <header className="mas-head">
        <span className={`mas-et${d.aparte ? " ap" : ""}`}>{d.etiqueta}</span>
        <h1>{d.titulo}</h1>
        <p className="lead">{d.lead}</p>
      </header>
      <div className="mas-video">
        <LoopVideo base={`/videos/svc_${d.id}`} poster={`/videos/posters/svc_${d.id}.webp`} label={d.titulo} />
      </div>
      <section className="mas-sec">
        <h2>Cómo funciona</h2>
        <ol className="mas-pasos">
          {d.pasos.map((p) => (
            <li key={p.t}>
              <b>{p.t}</b>
              <span>{p.d}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="mas-sec mas-dos">
        <div>
          <h2>Qué incluye</h2>
          <ul>
            {d.incluye.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Para quién es</h2>
          <p>{d.paraQuien}</p>
          {d.nota && <p className="nota-precio">{d.nota}</p>}
        </div>
      </section>
      <section className="mas-cta">
        <AgendarBtn texto={d.cta} evento={`mas:${d.id}`} />
        <Link href="/#planes" className="btn ghost">Ver planes del bot</Link>
        <Link href="/#videos" className="btn ghost">← Volver al camino principal</Link>
      </section>
      <section className="mas-sec">
        <h2>Sigue explorando</h2>
        <div className="mas-otros">
          {otros.map((o) => (
            <Link key={o.id} href={`/mas/${o.id}`} className="mas-o">
              <b>{o.titulo}</b>
              <span>{o.corto}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
