"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Aparición al hacer scroll: solo oculta lo que está bajo el pliegue, así no hay parpadeo al cargar. */
export function Reveal({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top <= innerHeight) return;
    el.classList.add("pre");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.remove("pre");
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rv ${className}`}>
      {children}
    </div>
  );
}
