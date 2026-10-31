"use client";

import { useState } from "react";
import { etiquetaPrecio, mostrarPrecioEjemplo, servicios } from "@/lib/services";
import { LoopVideo } from "./LoopVideo";

const CONTACTO = "#final";

export function ServiceGrid() {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <div className="grid">
      {servicios.map((s) => {
        const open = abierto === s.id;
        return (
          <article key={s.id} className={`card${s.destacado ? " hot" : ""}${open ? " open" : ""}`}>
            <div className="vid">
              <LoopVideo src={`/videos/svc_${s.id}.mp4`} label={`Demostración animada de ${s.nombre}`} />
              <div className="pp" id={`panel-${s.id}`} aria-hidden={!open}>
                <small>{mostrarPrecioEjemplo ? "Desde · precio de ejemplo" : "Desde"}</small>
                <b>{mostrarPrecioEjemplo ? s.precioEjemplo : "Cotizar"}</b>
                <small>Entrega {s.plazo}</small>
                <ul>
                  {s.incluye.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
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
