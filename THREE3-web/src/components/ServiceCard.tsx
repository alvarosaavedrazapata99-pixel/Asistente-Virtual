"use client";

import { useState } from "react";
import { INSTAGRAM_DM, textoPlazo, textoPrecio, type Servicio } from "@/lib/services";
import { Poster } from "./Poster";
import { VideoLoop } from "./VideoLoop";

export function ServiceCard({ s }: { s: Servicio }) {
  const [abierto, setAbierto] = useState(false);
  const precio = textoPrecio(s);
  const cotizar = precio === "Cotizar";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-cyan/15 bg-panel">
      <div className="relative aspect-video">
        <VideoLoop poster={<Poster etiqueta={s.nombre} />} label={`Demostración de ${s.nombre}`} />
        {abierto && (
          <div
            id={`panel-${s.id}`}
            className="absolute inset-0 z-10 flex flex-col gap-2 overflow-auto bg-night/95 p-4 text-sm"
          >
            <p className="font-display text-2xl text-orange">{precio}</p>
            <p className="text-cream/70">
              <span className="font-mono text-xs uppercase tracking-widest text-cyan">Plazo</span> {textoPlazo(s)}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-cream/85">
              {s.incluye.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <div className="mt-auto flex gap-2 pt-2">
              <a
                href={INSTAGRAM_DM}
                className="rounded-full bg-orange px-4 py-2 font-semibold text-night transition hover:brightness-110"
              >
                {cotizar ? "Cotizar" : "Activar"}
              </a>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-full border border-cream/30 px-4 py-2 text-cream/80 hover:border-cyan"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-2xl uppercase tracking-wide">{s.nombre}</h3>
        <p className="text-cream/75">{s.resumen}</p>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={`panel-${s.id}`}
          onClick={() => setAbierto((v) => !v)}
          className="mt-auto self-start rounded-full border border-cyan/50 px-4 py-2 text-sm font-semibold text-cyan transition hover:bg-cyan hover:text-night"
        >
          Ver precio
        </button>
      </div>
    </article>
  );
}
