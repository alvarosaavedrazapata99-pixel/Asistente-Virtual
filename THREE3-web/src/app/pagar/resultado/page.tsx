import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = { title: "THREE3 · Resultado del pago", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Resultado() {
  return (
    <main className="pay" id="pay" data-modo="resultado">
      <p className="mono">Resultado del pago</p>
      <h1 id="pay-titulo">Confirmando tu pago…</h1>
      <div className="pay-card" aria-live="polite">
        <p id="pay-estado" className="mute">Estamos verificando con Mercado Pago. Puede tardar unos segundos.</p>
        <Link className="btn ghost" href="/">Volver al inicio</Link>
        <p className="pay-nota">Si ya pagaste y no ves la confirmación, escríbenos por Instagram con el número de tu orden.</p>
      </div>
      <Script src="/pagar.js" strategy="afterInteractive" />
    </main>
  );
}
