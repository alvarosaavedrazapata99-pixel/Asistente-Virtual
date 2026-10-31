"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number };

/** Red de circuitos animada del hero. Se detiene con prefers-reduced-motion. */
export function CircuitCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let pts: P[] = [];
    let raf = 0;

    const resize = () => {
      const r = cv.getBoundingClientRect();
      const d = Math.min(2, devicePixelRatio || 1);
      W = cv.width = r.width * d;
      H = cv.height = r.height * d;
      pts = Array.from({ length: Math.round(W / d / 14) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25 * d,
        vy: (Math.random() - 0.5) * 0.25 * d,
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      if (!reduce) for (const p of pts) {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
      }
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < W / 9) {
            ctx.strokeStyle = `rgba(34,211,238,${0.16 * (1 - d / (W / 9))})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      ctx.fillStyle = "rgba(34,211,238,.5)";
      for (const p of pts) ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      if (!reduce) raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" />;
}
