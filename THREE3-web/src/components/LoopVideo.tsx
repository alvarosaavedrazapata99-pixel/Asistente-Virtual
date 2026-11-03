"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Props = {
  /** Ruta sin extensión, p. ej. "/videos/svc_crm". Se sirve WebM primero y MP4 de respaldo. */
  base: string;
  /** Imagen fija: primer cuadro y única imagen si hay prefers-reduced-motion. */
  poster: string;
  label: string;
};

const MQ = "(prefers-reduced-motion: reduce)";
const suscribir = (cb: () => void) => {
  const mq = matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const MQ_CEL = "(max-width: 640px)";
const suscribirLigero = (cb: () => void) => {
  const mq = matchMedia(MQ_CEL);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const esLigero = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return matchMedia(MQ_CEL).matches || c?.saveData === true;
};

/** Video en bucle, mudo; solo se reproduce cuando está visible y no hay prefers-reduced-motion. */
export function LoopVideo({ base, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducido = useSyncExternalStore(suscribir, () => matchMedia(MQ).matches, () => false);
  const ligero = useSyncExternalStore(suscribirLigero, esLigero, () => false); // versión _sm en celular o con ahorro de datos
  const [sonando, setSonando] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || reducido) return; // movimiento reducido: imagen fija + botón para reproducir
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reducido, ligero]);

  const alternar = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setSonando(true)).catch(() => {});
    else {
      v.pause();
      setSonando(false);
    }
  };

  return (
    <>
    <video key={ligero ? "sm" : "lg"} ref={ref} muted loop playsInline preload="none" poster={poster} aria-label={label}>
      <source src={`${base}${ligero ? "_sm" : ""}.webm`} type="video/webm" />
      <source src={`${base}${ligero ? "_sm" : ""}.mp4`} type="video/mp4" />
    </video>
    {reducido && (
      <button type="button" className="vplay" onClick={alternar} aria-label={sonando ? "Pausar video" : "Reproducir video"}>
        {sonando ? "❚❚" : "▶"}
      </button>
    )}
    </>
  );
}
