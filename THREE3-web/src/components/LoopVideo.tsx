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

/** Video en bucle, mudo; solo se reproduce cuando está visible y no hay prefers-reduced-motion. */
export function LoopVideo({ base, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducido = useSyncExternalStore(suscribir, () => matchMedia(MQ).matches, () => false);
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
  }, [reducido]);

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
    <video ref={ref} muted loop playsInline preload="none" poster={poster} aria-label={label}>
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
    {reducido && (
      <button type="button" className="vplay" onClick={alternar} aria-label={sonando ? "Pausar video" : "Reproducir video"}>
        {sonando ? "❚❚" : "▶"}
      </button>
    )}
    </>
  );
}
