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
          <p>Elige entre 20 negocios de ejemplo, comercios y empresas. Conversa con el bot, mira cómo califica al cliente, lo registra con su prioridad y lo suma a tu reporte.</p>
        </Reveal>
        <div className="demo" id="demo-app">
          <div className="demo-neg" id="demo-neg" role="group" aria-label="Negocio de ejemplo" />
          <div className="demo-tabs" role="tablist" aria-label="Qué ver">
            <button type="button" role="tab" id="demo-t-chat" aria-selected="true" aria-controls="demo-chat" data-tab="chat">1. El bot atiende</button>
            <button type="button" role="tab" id="demo-t-crm" aria-selected="false" aria-controls="demo-crm" data-tab="crm">2. Queda registrado</button>
            <button type="button" role="tab" id="demo-t-rep" aria-selected="false" aria-controls="demo-rep" data-tab="rep">3. Tu reporte</button>
          </div>
          <div id="demo-chat" role="tabpanel" aria-labelledby="demo-t-chat">
            <div className="wa" id="demo-wa">
              <header className="wa-h">
                <span className="wa-av" id="wa-av" aria-hidden="true" />
                <div className="wa-id">
                  <b id="wa-nom" />
                  <small id="wa-est">Asistente virtual con IA</small>
                </div>
              </header>
              <div className="wa-cuerpo" id="demo-body">
                <div className="wa-fecha">Hoy</div>
                <div className="wa-aviso">Los mensajes de esta demostración son simulados. Este asistente es una inteligencia artificial.</div>
                <div className="demo-log" id="demo-log" role="log" aria-live="polite" />
                <div className="demo-chips" id="demo-chips" />
              </div>
              <form className="wa-in" id="demo-libre" hidden>
                <label className="sr" htmlFor="demo-libre-in">Escríbele al bot lo que quieras</label>
                <input id="demo-libre-in" autoComplete="off" maxLength={300} placeholder="Escribe un mensaje" />
                <button type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 20.5v-6.8l9-1.7-9-1.7V3.5L22 12z" fill="currentColor" /></svg></button>
              </form>
              <form className="wa-in" id="demo-form" hidden>
                <label className="sr" htmlFor="demo-in" id="demo-lbl">Tu respuesta</label>
                <input id="demo-in" autoComplete="off" maxLength={60} />
                <button type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 20.5v-6.8l9-1.7-9-1.7V3.5L22 12z" fill="currentColor" /></svg></button>
              </form>
              <div className="wa-in wa-pie" id="wa-pie" aria-hidden="true"><span>Elige una opción para responder</span></div>
            </div>
          </div>
          <div id="demo-crm" role="tabpanel" aria-labelledby="demo-t-crm" hidden>
            <p className="mute" id="demo-crm-vacio">Aún no hay clientes. Haz una consulta en el paso 1 y regístrate como cliente de ejemplo.</p>
            <div className="demo-cols" id="demo-cols" />
          </div>
          <div id="demo-rep" role="tabpanel" aria-labelledby="demo-t-rep" hidden>
            <div className="demo-kpis" id="demo-kpis" />
            <div className="demo-barras" id="demo-barras" />
          </div>
          <p className="mute demo-nota">Demostración simulada con negocios de ejemplo (ficticios). Lo que escribes aquí no se envía ni se guarda. Así se vería el bot en WhatsApp; el diseño está inspirado en esa aplicación (WhatsApp es una marca de Meta). El bot real entiende texto libre y usa la información de tu negocio.</p>
        </div>
      </div>
      <Script src="/demo.js" strategy="afterInteractive" />
    </section>
  );
}
