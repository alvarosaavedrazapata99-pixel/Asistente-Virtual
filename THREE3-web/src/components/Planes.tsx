import { ACLARACION, mensualidadIncluye, PRECIOS_BAJO_CLIC, planes, soles } from "@/lib/planes";
import { AgendarBtn } from "./AgendarBtn";
import { LoopVideo } from "./LoopVideo";
import { Reveal } from "./Reveal";

const COMUN = ["Diagnóstico automático gratis (3 minutos)", "Implementación y puesta en marcha", "Cuidado mensual incluido"];

export function Planes() {
  return (
    <section id="planes">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Planes</span>
            <h2 style={{ marginTop: 10 }}>Elige cómo empezar</h2>
          </div>
          <p>Precios en soles, desde. El alcance exacto y el precio final los confirmas por escrito después del diagnóstico.</p>
        </Reveal>
        <Reveal className="vid-banner">
          <LoopVideo base="/videos/sec_planes" poster="/videos/posters/sec_planes.webp" label="Animación de los planes Inicial, Profesional, Avanzado y el módulo de leads y CRM" />
        </Reveal>
        <Reveal className="plans">
          {planes.map((p) => (
            <article key={p.id} className={`plan${p.destacado ? " hot" : ""}`}>
              {p.destacado ? <span className="etq">Más elegido para empezar</span> : p.modulo ? <span className="etq">Se suma a tu bot</span> : <span className="etq">Plan</span>}
              <h3>{p.modulo ? p.nombre : `Plan ${p.nombre}`}</h3>
              <p className="resumen">{p.resumen}</p>
              {PRECIOS_BAJO_CLIC ? (
                <details className="inversion">
                  <summary>Ver inversión</summary>
                  <div className="precio">
                    <small>Desde</small>
                    <b>{soles(p.inicial)} <span>pago inicial</span></b>
                    <span className="mes">+ {soles(p.mensual)} al mes</span>
                    <p className="nota-precio">{ACLARACION}</p>
                  </div>
                </details>
              ) : (
                <div className="precio">
                  <small>Desde</small>
                  <b>{soles(p.inicial)} <span>pago inicial</span></b>
                  <span className="mes">+ {soles(p.mensual)} al mes</span>
                </div>
              )}
              <ul>
                {COMUN.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <AgendarBtn className="btn ghost" texto="Hacer mi diagnóstico" evento={`plan:${p.id}`} servicio={p.id} />
              {!PRECIOS_BAJO_CLIC && <p className="nota-precio">{ACLARACION}</p>}
            </article>
          ))}
        </Reveal>
        <Reveal className="incluye-mes">
          <b>La mensualidad incluye</b>
          <ul>
            {mensualidadIncluye.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="nota-precio" style={{ marginTop: 12 }}>{ACLARACION}</p>
        </Reveal>
      </div>
    </section>
  );
}
