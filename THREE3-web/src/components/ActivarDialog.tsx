import { INSTAGRAM_DM, servicios } from "@/lib/services";

/** Formulario de solicitud. La lógica vive en /activar.js (se comparte con el enlace de revisión). */
export function ActivarDialog() {
  return (
    <dialog id="activar" className="dlg" aria-labelledby="activar-t" data-endpoint={process.env.NEXT_PUBLIC_LEADS_ENDPOINT ?? ""}>
      <form noValidate>
        <div className="dlg-h">
          <h2 id="activar-t">Activa tu servicio</h2>
          <button type="button" className="dlg-x" data-cerrar aria-label="Cerrar">×</button>
        </div>
        <p className="dlg-s">Cuéntanos lo básico. Te respondemos para confirmar alcance, plazo y precio antes de que pagues.</p>

        <label htmlFor="f-servicio">Servicio</label>
        <select id="f-servicio" name="servicio" defaultValue={servicios[0].id}>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>

        <label htmlFor="f-nombre">Tu nombre</label>
        <input id="f-nombre" name="nombre" autoComplete="name" required aria-describedby="e-nombre" />
        <span className="err" id="e-nombre" data-err="nombre" role="alert" />

        <label htmlFor="f-negocio">Tu negocio <small>(opcional)</small></label>
        <input id="f-negocio" name="negocio" autoComplete="organization" />

        <label htmlFor="f-contacto">Correo o celular</label>
        <input id="f-contacto" name="contacto" autoComplete="email" inputMode="email" required aria-describedby="e-contacto" />
        <span className="err" id="e-contacto" data-err="contacto" role="alert" />

        <label htmlFor="f-detalle">¿Qué necesitas lograr? <small>(opcional)</small></label>
        <textarea id="f-detalle" name="detalle" rows={3} />

        <label className="chk" htmlFor="f-acepto">
          <input id="f-acepto" name="acepto" type="checkbox" aria-describedby="e-acepto" />
          <span>
            Autorizo que THREE3 use estos datos solo para responder mi solicitud. Revisa la{" "}
            <a href="/legal#datos" target="_blank" rel="noopener">información sobre datos personales</a>.
          </span>
        </label>
        <span className="err" id="e-acepto" data-err="acepto" role="alert" />

        {process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY && (
          <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY} data-theme="dark" data-appearance="interaction-only" />
        )}
        <input className="trampa" name="web_url_trampa" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" className="btn">Preparar mi solicitud</button>
      </form>

      <div data-ok hidden>
        <h2 tabIndex={-1}>Tu solicitud está lista</h2>
        <p className="dlg-s solo-manual">Aún no se envía. Cópiala y pégala en un mensaje directo de Instagram para que la recibamos.</p>
        <pre data-resumen className="dlg-pre" />
        <div className="cta">
          <button type="button" className="btn solo-manual" data-copiar>Copiar solicitud</button>
          <a className="btn ghost solo-manual" href={INSTAGRAM_DM} target="_blank" rel="noopener noreferrer">Abrir Instagram</a>
          <button type="button" className="btn ghost" data-cerrar>Cerrar</button>
        </div>
        <p className="dlg-s" data-estado role="status" />
      </div>
    </dialog>
  );
}
