"use client";

import { useState } from "react";
import { MOSTRAR_PRECIO_EJEMPLO, etiquetaPrecio, servicios, textoDesde, textoMensual, textoUsd } from "@/lib/services";
import { LoopVideo } from "./LoopVideo";

const CONTACTO = "#final";

export function ServiceGrid() {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <div className="grid">
      {servicios.map((s) => {
        const open = abierto === s.id;
        return (
          <article key={s.id} data-cat={s.categoria} className={`card${s.destacado ? " hot" : ""}${s.ancho ? " wide" : ""}${open ? " open" : ""}`}>
            <div className="vid">
              <LoopVideo base={`/videos/${s.video}`} poster={`/videos/posters/${s.video}.webp`} label={`Demostración animada de ${s.nombre}`} />
              <div className="pp" id={`panel-${s.id}`} aria-hidden={!open}>
                <small>{MOSTRAR_PRECIO_EJEMPLO ? "Desde · precio de ejemplo" : "Desde"}</small>
                <b>{textoDesde(s)} <i>{textoUsd(s)}</i></b>
                <small>Entrega {s.entrega}{s.mensualPen ? ` · ${textoMensual(s)}` : ""}</small>
                <ul>
                  {s.incluye.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                {s.nota && <em>{s.nota}</em>}
                <a className="btn" href={CONTACTO} data-activar={s.id} tabIndex={open ? 0 : -1}>
                  Activar
                </a>
              </div>
            </div>
            <h3>{s.nombre}</h3>
            <p>{s.resumen}</p>
            <div className="foot">
              <span className="price">{etiquetaPrecio(s)}</span>
              <button
                type="button"
                className={`btn ${s.destacado ? "" : "ghost"}`}
                aria-expanded={open}
                aria-controls={`panel-${s.id}`}
                onClick={() => setAbierto(open ? null : s.id)}
              >
                {open ? "Cerrar" : "Ver precio"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
