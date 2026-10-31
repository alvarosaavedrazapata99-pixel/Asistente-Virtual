"use client";

import { useEffect, useRef } from "react";

/** Video en bucle, mudo; solo se reproduce cuando está visible y no hay prefers-reduced-motion. */
export function LoopVideo({ src, label }: { src: string; label: string }) {
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

  // "#t=0.1" fuerza a mostrar el primer cuadro como póster sin descargar el video completo.
  return <video ref={ref} muted loop playsInline preload="metadata" src={`${src}#t=0.1`} aria-label={label} />;
}
