import { ACLARACION, mensualidadDetalle, PAGOS_APARTE, WEB, PRECIOS_BAJO_CLIC, planes, soles } from "@/lib/planes";
import { AgendarBtn } from "./AgendarBtn";
import { Reveal } from "./Reveal";

const COMUN = ["Diagnóstico automático gratis", "Implementación y puesta en marcha", "Cuidado mensual incluido"];

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
        <Reveal className="plans">
          {planes.map((p) => (
            <article key={p.id} className={`plan${p.destacado ? " hot" : ""}`}>
              {p.destacado ? <span className="etq">Más elegido para empezar</span> : p.modulo ? <span className="etq">Se suma a tu bot</span> : <span className="etq">Plan</span>}
              <h3>{p.modulo ? p.nombre : `Plan ${p.nombre}`}</h3>
              <p className="resumen">{p.resumen}</p>
              {p.para && <p className="para"><b>Ideal para:</b> {p.para}</p>}
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
              <ul className="inc">
                {(p.incluye ?? []).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              {p.nota && <p className="nota-plan">{p.nota}</p>}
              <ul className="com">
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
          <b>¿Por qué hay una mensualidad? Porque tu bot necesita cuidado todos los meses</b>
          <p className="nota-precio">Un bot no se instala y se olvida: tus precios cambian, Meta cambia sus reglas y tus clientes preguntan cosas nuevas. Esto es lo que haces con tu mensualidad:</p>
          <div className="mes-g">
            {mensualidadDetalle.map((x) => (
              <div key={x.t}>
                <b>{x.t}</b>
                <span>{x.d}</span>
              </div>
            ))}
          </div>
          <p className="nota-precio" style={{ marginTop: 12 }}>{PAGOS_APARTE}</p>
        </Reveal>
        <Reveal className="incluye-mes web-n">
          <b>{WEB.titulo}</b>
          <p className="nota-precio">{WEB.texto}</p>
          <AgendarBtn className="btn ghost" texto="Cotizar mi página web" evento="plan:web" />
        </Reveal>
      </div>
    </section>
  );
}
