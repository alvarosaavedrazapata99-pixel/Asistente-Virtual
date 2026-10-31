"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Ruta sin extensión, p. ej. "/videos/svc_crm". Se sirve WebM primero y MP4 de respaldo. */
  base: string;
  /** Imagen fija: primer cuadro y única imagen si hay prefers-reduced-motion. */
  poster: string;
  label: string;
};

/** Video en bucle, mudo; solo se reproduce cuando está visible y no hay prefers-reduced-motion. */
export function LoopVideo({ base, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video ref={ref} muted loop playsInline preload="none" poster={poster} aria-label={label}>
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}
