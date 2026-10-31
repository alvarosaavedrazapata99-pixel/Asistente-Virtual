"use client";

import { useEffect, useState } from "react";
import { INSTAGRAM_URL } from "@/lib/services";
import { Reveal } from "./Reveal";

const MENSAJES = [
  "Comentario “AUTOMATIZACIÓN” → lead en tu CRM",
  "Mensaje directo → el chatbot responde",
  "Reel guardado → seguimiento automático",
  "Pregunta en comentarios → respuesta en minutos",
];
const TILES = ["REEL", "CARRUSEL", "REEL", "POST", "REEL", "CARRUSEL"];

export function Instagram() {
  const [k, setK] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setK((v) => (v + 1) % MENSAJES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="instagram">
      <div className="w">
        <Reveal className="ig">
          <div>
            <span className="mono">Síguenos</span>
            <h2 style={{ margin: "10px 0 16px" }}>Todo empieza en @three_3agency</h2>
            <p style={{ color: "var(--mute)", marginBottom: 22 }}>
              Lo último que publicamos aparece aquí solo. Comenta la palabra clave de un reel y te respondemos con el
              servicio que encaja.
            </p>
            <a className="btn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              Abrir Instagram
            </a>
          </div>
          <div>
            <div className="igg">
              {TILES.map((t, i) => (
                <div key={i} style={{ "--i": i } as React.CSSProperties}>{t}</div>
              ))}
            </div>
            <span className="igchip">
              <i />
              <span aria-live="off">{MENSAJES[k]}</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
