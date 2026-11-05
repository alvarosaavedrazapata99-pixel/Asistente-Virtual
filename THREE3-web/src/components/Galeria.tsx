import galeria from "@/config/galeria.config.json";
import { LoopVideo } from "./LoopVideo";
import { Reveal } from "./Reveal";

type Item = { tipo: string; titulo: string; detalle: string; imagen?: string; video?: string };
const ETIQUETA: Record<string, string> = { personaje: "Personaje 3D", juego: "Videojuego" };

/** Galería de trabajos. Solo muestra lo que está en galeria.config.json (trabajos reales). */
export function Galeria() {
  const items = galeria.items as Item[];
  return (
    <Reveal className="galeria">
      <h3 className="gal-t">Personajes y videojuegos</h3>
      <div className="gal-g">
        {items.map((it) => (
          <figure key={it.titulo} className="gal-i">
            <div className="gal-m">
              {it.video ? (
                <LoopVideo base={`/videos/${it.video}`} poster={`/videos/posters/${it.video}.webp`} label={it.titulo} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.imagen} alt={it.titulo} loading="lazy" decoding="async" />
              )}
              <span className="gal-e">{ETIQUETA[it.tipo] ?? it.tipo}</span>
            </div>
            <figcaption>
              <b>{it.titulo}</b>
              <span>{it.detalle}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Reveal>
  );
}
