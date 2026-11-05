import { enlaceWhatsApp } from "@/lib/planes";
import { INSTAGRAM_URL } from "@/lib/services";
import { Reveal } from "./Reveal";

export function Instagram() {
  const wa = enlaceWhatsApp("Hola THREE3, quiero más información.");
  return (
    <section id="instagram">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Síguenos</span>
            <h2 style={{ marginTop: 10 }}>Todo empieza en @three_3agency</h2>
          </div>
          <p>Mira cómo trabajamos y escríbenos por mensaje directo.</p>
        </Reveal>
        <div className="redes-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.webp" alt="" width={72} height={72} loading="lazy" decoding="async" />
          <div className="rc-t">
            <b>@three_3agency</b>
            <span>Bots con IA, automatización y contenido para negocios. Escríbenos por mensaje directo y te respondemos.</span>
          </div>
        <div className="redes">
          <a className="red red-ig" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram de THREE3">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
            </svg>
            <span>Seguir en Instagram</span>
          </a>
          {wa && (
            <a className="red red-wa" href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de THREE3">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3.5 20.5l1.3-4.6A8.5 8.5 0 1 1 8.2 19.3z" />
                <path d="M9 8.8c.2 2.6 2.6 5 5.2 5.2l1.1-1.2-1.9-1-.8.6a4 4 0 0 1-1.7-1.7l.6-.8-1-1.9z" fill="currentColor" stroke="none" />
              </svg>
              <span>Escribir por WhatsApp</span>
            </a>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
