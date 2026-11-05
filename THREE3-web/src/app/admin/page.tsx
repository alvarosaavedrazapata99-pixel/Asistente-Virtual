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
      <div id="adm-lista" />
      <Script src="/admin.js" strategy="afterInteractive" />
    </main>
  );
}
