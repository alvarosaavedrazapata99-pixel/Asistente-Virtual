"use client";

import { useState } from "react";
import { Tri } from "./Tri";

/** Comparador boceto ↔ render. Placeholder con Tri; se reemplaza por renders reales de Blender. */
export function CharacterCompare() {
  const [pos, setPos] = useState(50);
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-cyan/20 bg-panel">
        <div className="absolute inset-0 flex items-center justify-center bg-night">
          <Tri size={230} variant="boceto" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-panel" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <Tri size={230} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-cyan" style={{ left: `${pos}%` }} />
        <span className="absolute left-3 top-3 font-mono text-xs uppercase text-cream/70">Boceto</span>
        <span className="absolute right-3 top-3 font-mono text-xs uppercase text-cyan">Render</span>
      </div>
      <label className="block text-sm text-cream/70">
        Compara boceto y render
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="mt-2 w-full accent-cyan"
        />
      </label>
      <p className="text-xs text-cream/50">Ejemplo ilustrativo.</p>
    </div>
  );
}
