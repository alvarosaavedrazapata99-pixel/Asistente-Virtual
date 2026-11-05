import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = { title: "THREE3 · Panel", robots: { index: false, follow: false }, referrer: "no-referrer" };

/** Panel privado: lista las solicitudes de clientes. Pide la clave de administración; no se enlaza desde ninguna página. */
export default function Admin() {
  return (
    <main className="adm" id="adm">
      <p className="mono">Panel privado</p>
      <h1>Solicitudes</h1>
      <form id="adm-form" className="adm-form" autoComplete="off">
        <label htmlFor="adm-clave">Clave de administración</label>
        <input id="adm-clave" type="password" autoComplete="off" required />
        <button type="submit" className="btn">Entrar</button>
      </form>
      <p id="adm-estado" className="mute" role="status" />
      <div className="adm-tabs" id="adm-tabs" role="tablist" hidden>
        <button type="button" role="tab" aria-selected="true" data-seccion="sol" className="btn ghost">Solicitudes</button>
        <button type="button" role="tab" aria-selected="false" data-seccion="cli" className="btn ghost">Clientes del bot</button>
      </div>
      <div id="adm-lista" />
      <section id="adm-cli" hidden>
        <p className="mute">Cada cliente es un chat con IA que pegas en su página con una línea de código. Solo funciona en los dominios que registres.</p>
        <button type="button" className="btn" id="adm-cli-nuevo">+ Nuevo cliente</button>
        <div id="adm-cli-lista" />
        <form id="adm-cli-form" className="adm-form adm-cli-form" hidden autoComplete="off">
          <h2 id="adm-cli-titulo">Nuevo cliente</h2>
          <label htmlFor="c-id">Identificador (minúsculas, números y guiones)</label>
          <input id="c-id" maxLength={40} pattern="[a-z0-9-]{2,40}" required />
          <label htmlFor="c-nombre">Nombre del negocio</label>
          <input id="c-nombre" maxLength={120} required />
          <label htmlFor="c-desc">Lo que sabe el bot: servicios, horarios, políticas, preguntas frecuentes</label>
          <textarea id="c-desc" rows={8} maxLength={6000} required />
          <label htmlFor="c-saludo">Saludo</label>
          <input id="c-saludo" maxLength={300} />
          <label htmlFor="c-wa">WhatsApp de derivación (con código de país, opcional)</label>
          <input id="c-wa" inputMode="numeric" maxLength={20} />
          <label htmlFor="c-color">Color</label>
          <input id="c-color" type="color" defaultValue="#1e6bff" />
          <label htmlFor="c-dom">Dominios permitidos, uno por línea (ej. https://www.minegocio.pe)</label>
          <textarea id="c-dom" rows={3} required />
          <label htmlFor="c-lim">Tope de consultas por día</label>
          <input id="c-lim" type="number" min={1} max={5000} defaultValue={300} />
          <label className="chk" htmlFor="c-act"><input id="c-act" type="checkbox" /> <span>Activo (el chat aparece en su página)</span></label>
          <div className="cta">
            <button type="submit" className="btn">Guardar</button>
            <button type="button" className="btn ghost" id="adm-cli-cancelar">Cancelar</button>
          </div>
          <p className="mute" id="adm-cli-msg" role="status" />
        </form>
        <div id="adm-cli-leads" />
      </section>
      <Script src="/admin.js" strategy="afterInteractive" />
      <Script src="/admin-clientes.js" strategy="afterInteractive" />
    </main>
  );
}
