import { CircuitBg } from "./CircuitBg";
import { Tri } from "./Tri";

/** Póster placeholder: red de circuitos + Tri abajo a la derecha (mismo estilo en toda la web). */
export function Poster({ etiqueta }: { etiqueta?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-panel">
      <CircuitBg />
      {etiqueta && (
        <span className="absolute left-4 top-4 font-mono text-xs uppercase tracking-widest text-cyan/80">
          {etiqueta}
        </span>
      )}
      <Tri size={86} className="absolute bottom-2 right-3 drop-shadow-[0_0_18px_rgba(34,211,238,.35)]" />
    </div>
  );
}
