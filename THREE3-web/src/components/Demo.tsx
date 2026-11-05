import Script from "next/script";
import { Reveal } from "./Reveal";

/** Demostración interactiva y simulada (sin red, sin IA, sin guardar datos). La lógica vive en /demo.js. */
export function Demo() {
  return (
    <section id="demo">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Pruébalo tú mismo</span>
            <h2 style={{ marginTop: 10 }}>Mira cómo atiende tu bot</h2>
          </div>
          <p>Elige un negocio de ejemplo, escríbele al bot y mira cómo la consulta termina como cliente registrado, con su reporte.</p>
        </Reveal>
        <div className="demo" id="demo-app">
          <div className="demo-neg" role="group" aria-label="Negocio de ejemplo">
            <button type="button" data-neg="polleria" aria-pressed="true">Pollería</button>
            <button type="button" data-neg="dental" aria-pressed="false">Clínica dental</button>
            <button type="button" data-neg="ropa" aria-pressed="false">Tienda de ropa</button>
          </div>
          <div className="demo-tabs" role="tablist" aria-label="Qué ver">
            <button type="button" role="tab" id="demo-t-chat" aria-selected="true" aria-controls="demo-chat" data-tab="chat">1. El bot atiende</button>
            <button type="button" role="tab" id="demo-t-crm" aria-selected="false" aria-controls="demo-crm" data-tab="crm">2. Queda registrado</button>
            <button type="button" role="tab" id="demo-t-rep" aria-selected="false" aria-controls="demo-rep" data-tab="rep">3. Tu reporte</button>
          </div>
          <div id="demo-chat" role="tabpanel" aria-labelledby="demo-t-chat">
            <div className="demo-log" id="demo-log" role="log" aria-live="polite" />
            <div className="demo-chips" id="demo-chips" />
            <form className="demo-form" id="demo-form" hidden>
              <label className="sr" htmlFor="demo-in" id="demo-lbl">Tu respuesta</label>
              <input id="demo-in" autoComplete="off" maxLength={60} />
              <button type="submit" className="btn">Enviar</button>
            </form>
          </div>
          <div id="demo-crm" role="tabpanel" aria-labelledby="demo-t-crm" hidden>
            <p className="mute" id="demo-crm-vacio">Aún no hay clientes. Haz una consulta en el paso 1 y regístrate como cliente de ejemplo.</p>
            <div className="demo-cols" id="demo-cols" />
          </div>
          <div id="demo-rep" role="tabpanel" aria-labelledby="demo-t-rep" hidden>
            <div className="demo-kpis" id="demo-kpis" />
            <div className="demo-barras" id="demo-barras" />
          </div>
          <p className="mute demo-nota">Demostración simulada con negocios de ejemplo (ficticios). Lo que escribes aquí no se envía ni se guarda. El bot real entiende texto libre y usa la información de tu negocio.</p>
        </div>
      </div>
      <Script src="/demo.js" strategy="afterInteractive" />
    </section>
  );
}
