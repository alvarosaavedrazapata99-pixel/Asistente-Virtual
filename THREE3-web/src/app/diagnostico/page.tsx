import type { Metadata } from "next";
import Link from "next/link";
import { ACLARACION, enlaceWhatsApp, planes } from "@/lib/planes";

export const metadata: Metadata = {
  title: "Diagnóstico gratis de tu negocio · THREE3",
  description: "Responde unas preguntas (3 minutos) y recibe al instante tu diagnóstico: cuánto de tu atención está automatizada, qué podrías estar perdiendo y por dónde empezar.",
};

/** Asistente del diagnóstico automático. La lógica vive en /diagnostico.js y /diagnostico-core.js (se comparte con el servidor). */
export default function Diagnostico() {
  const datosPlanes = Object.fromEntries(
    planes.map((p) => [p.id, { n: p.modulo ? p.nombre : `Plan ${p.nombre}`, r: p.resumen, i: p.inicial, m: p.mensual }]),
  );
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;
  return (
    <main className="dg" id="dg" data-planes={JSON.stringify(datosPlanes)} data-wa={enlaceWhatsApp("Hola THREE3, hice el diagnóstico de mi negocio en su web y quiero conversar.")} data-aclaracion={ACLARACION}>
      <header className="dg-top">
        <Link href="/" className="brand">THREE3</Link>
        <span className="mono">Diagnóstico gratis · 3 minutos</span>
      </header>

      <div className="dg-caja">
        <div className="dg-prog" id="dg-prog" hidden><i id="dg-barra" /><span id="dg-paso" /></div>
        <div id="dg-vista" aria-live="polite">
          <h1>Descubre cuánto puede mejorar la atención de tu negocio</h1>
          <p className="lead">Responde unas preguntas rápidas y recibe al instante tu diagnóstico. No pagas nada y no necesitas llamada.</p>
          <noscript><p className="err">Necesitas activar JavaScript para hacer el diagnóstico.</p></noscript>
        </div>

        <form id="dg-datos" className="dg-datos" noValidate hidden>
          <h2>Último paso: ¿a dónde te enviamos tu diagnóstico?</h2>
          <label htmlFor="dg-nombre">Tu nombre</label>
          <input id="dg-nombre" name="nombre" autoComplete="name" maxLength={120} required />
          <label htmlFor="dg-negocio">Tu negocio <small>(opcional)</small></label>
          <input id="dg-negocio" name="negocio" autoComplete="organization" maxLength={120} />
          <label htmlFor="dg-cel">Celular o WhatsApp</label>
          <input id="dg-cel" name="celular" inputMode="tel" autoComplete="tel" maxLength={20} />
          <label htmlFor="dg-mail">Correo <small>(te enviamos una copia)</small></label>
          <input id="dg-mail" name="email" type="email" autoComplete="email" maxLength={120} />
          <span className="err" id="dg-err" role="alert" />
          <label className="chk" htmlFor="dg-ok">
            <input id="dg-ok" name="ok" type="checkbox" />
            <span>Autorizo que THREE3 use estos datos para enviarme mi diagnóstico y contactarme. Lee la <Link href="/legal#privacidad" target="_blank">política de privacidad</Link>.</span>
          </label>
          {sitekey && <div className="cf-turnstile" data-sitekey={sitekey} data-theme="dark" data-appearance="interaction-only" />}
          <input className="trampa" name="web_url_trampa" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="cta">
            <button type="submit" className="btn amb" id="dg-enviar">Ver mi diagnóstico</button>
            <button type="button" className="btn ghost" id="dg-atras-datos">Atrás</button>
          </div>
        </form>
      </div>
    </main>
  );
}
