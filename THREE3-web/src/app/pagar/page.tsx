import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = { title: "THREE3 · Pago", robots: { index: false, follow: false }, referrer: "no-referrer" };

/** Página de pago: el cobro se hace en Mercado Pago; THREE3 nunca ve ni guarda datos de tarjeta. */
export default function Pagar() {
  return (
    <main className="pay" id="pay" data-modo="pagar">
      <p className="mono">Pago seguro</p>
      <h1>Confirma tu pago</h1>
      <div className="pay-card" aria-live="polite">
        <p id="pay-estado" className="mute">Cargando tu orden…</p>
        <dl id="pay-datos" hidden>
          <dt>Servicio</dt><dd id="pay-desc" />
          <dt>Total</dt><dd id="pay-monto" />
        </dl>
        <button type="button" className="btn" id="pay-btn" hidden>Pagar con Mercado Pago</button>
        <p className="pay-nota">Pagas en la página de Mercado Pago. THREE3 no ve ni guarda los datos de tu tarjeta. Revisa la <Link href="/legal">información legal</Link>.</p>
      </div>
      <Script src="/pagar.js" strategy="afterInteractive" />
    </main>
  );
}
