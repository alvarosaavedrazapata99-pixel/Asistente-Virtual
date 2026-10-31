"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  /** Ruta sin extensión, p. ej. "/videos/svc_chatbot". Si falta, solo se muestra el póster. */
  base?: string;
  /** Póster/placeholder (imagen o SVG). Es lo único que se ve con reduced-motion. */
  poster: ReactNode;
  label: string;
};

/** Video en bucle: WebM primero, MP4 de respaldo; solo se reproduce cuando está visible. */
export function VideoLoop({ base, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced, base]);

  if (!base || reduced) {
    return (
      <div className="absolute inset-0" role="img" aria-label={label}>
        {poster}
      </div>
    );
  }

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    >
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}
