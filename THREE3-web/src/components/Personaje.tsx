"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

const PASOS = [
  { n: "Una esfera", t: "La forma base: la cabeza." },
  { n: "Cabeza y cuerpo", t: "Proporciones de juguete y audífonos." },
  { n: "Antena y detalles", t: "Las tres antenitas, pantalla, sonrisa y el 3." },
  { n: "Render final", t: "Materiales, luces y turntable en Blender." },
];

const Flecha = ({ on }: { on: boolean }) => (
  <svg className={`arr${on ? " on" : ""}`} viewBox="0 0 54 20" preserveAspectRatio="none" aria-hidden="true">
    <line x1="4" y1="10" x2="46" y2="10" />
    <line className="fl" pathLength={1} x1="4" y1="10" x2="46" y2="10" />
    <polyline points="40,3 49,10 40,17" />
  </svg>
);

function Comparador() {
  const [p, setP] = useState(50);
  return (
    <div className="cmp" style={{ "--p": `${p}%` } as React.CSSProperties}>
      <div className="layer sk">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Boceto en blanco y negro" src="/assets/tri-render.webp" />
      </div>
      <div className="layer rd">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Render final" src="/assets/tri-render.webp" />
      </div>
      <div className="bar" />
      <span className="lb l1">BOCETO</span>
      <span className="lb l2">RENDER</span>
      <input
        type="range"
        min={0}
        max={100}
        value={p}
        onChange={(e) => setP(Number(e.target.value))}
        aria-label="Comparar boceto y render"
      />
    </div>
  );
}

function Camino() {
  const [cur, setCur] = useState(-1);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const box = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const play = useCallback(() => {
    clearInterval(timer.current);
    setCur(-1);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setCur(3);
    let i = 0;
    const step = () => {
      setCur(i++);
      if (i > 3) clearInterval(timer.current);
    };
    setTimeout(step, 300);
    timer.current = setInterval(step, 2300);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          play();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer.current);
    };
  }, [play]);

  const cls = (k: number) => `st${cur === k ? " on" : ""}${k < cur ? " done" : ""}`;
  const pick = (k: number) => {
    clearInterval(timer.current);
    setCur(k);
  };

  return (
    <Reveal className="path">
      <h3>El camino de Tri, paso a paso</h3>
      <div className="pw" ref={box}>
        <button className={cls(0)} type="button" onClick={() => pick(0)}>
          <div className="cv dr">
            <svg viewBox="0 0 200 260">
              <circle pathLength={1} cx="100" cy="125" r="82" />
              <path className="g" pathLength={1} d="M100 28V222" />
              <path className="g" pathLength={1} d="M20 135Q100 190 180 135" />
            </svg>
          </div>
          <span className="n">PASO 1</span>
          <b>{PASOS[0].n}</b>
          <small>{PASOS[0].t}</small>
        </button>
        <Flecha on={0 < cur} />
        <button className={cls(1)} type="button" onClick={() => pick(1)}>
          <div className="cv dr">
            <svg viewBox="0 0 200 260">
              <circle pathLength={1} cx="100" cy="95" r="64" />
              <circle pathLength={1} cx="30" cy="100" r="17" />
              <circle pathLength={1} cx="170" cy="100" r="17" />
              <rect pathLength={1} x="58" y="168" width="84" height="72" rx="22" />
              <path className="g" pathLength={1} d="M100 20V245" />
            </svg>
          </div>
          <span className="n">PASO 2</span>
          <b>{PASOS[1].n}</b>
          <small>{PASOS[1].t}</small>
        </button>
        <Flecha on={1 < cur} />
        <button className={cls(2)} type="button" onClick={() => pick(2)}>
          <div className="cv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sk" alt="Boceto con antena y detalles" src="/assets/tri-boceto.webp" />
          </div>
          <span className="n">PASO 3</span>
          <b>{PASOS[2].n}</b>
          <small>{PASOS[2].t}</small>
        </button>
        <Flecha on={2 < cur} />
        <button className={cls(3)} type="button" onClick={() => pick(3)}>
          <div className="cv dk">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Tri renderizado" src="/assets/tri-render.webp" />
          </div>
          <span className="n">PASO 4</span>
          <b>{PASOS[3].n}</b>
          <small>{PASOS[3].t}</small>
        </button>
      </div>
      <div className="ctl">
        <button className="btn ghost" type="button" onClick={play}>
          Repetir animación
        </button>
        <span>Toca un paso para verlo</span>
      </div>
    </Reveal>
  );
}

export function Personaje() {
  return (
    <section id="personaje">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Servicio creativo</span>
            <h2 style={{ marginTop: 10 }}>Tu personaje 3D, del boceto al render</h2>
          </div>
          <p>Un personaje original para tu marca, en estilo juguete 3D. Mueve el control para ver el proceso.</p>
        </Reveal>
        <div className="p3d">
          <Comparador />
          <div>
            <ol className="steps">
              <li><span>1</span><div><b>Briefing</b><small>Cuéntanos concepto, estilo y usos. Sin marcas ni personajes de terceros.</small></div></li>
              <li><span>2</span><div><b>Boceto en blanco y negro</b><small>Apruebas la forma antes de modelar. Incluye antena, accesorios y expresiones.</small></div></li>
              <li><span>3</span><div><b>Modelado y render</b><small>Blender: materiales, luces y turntable 360° en video.</small></div></li>
              <li><span>4</span><div><b>Entrega con licencia</b><small>PNG, video, modelo GLB y licencia comercial en PDF.</small></div></li>
            </ol>
            <div className="cta" style={{ marginTop: 22 }}>
              <a className="btn" href="#final" data-activar="personaje">Cotizar mi personaje</a>
            </div>
          </div>
        </div>
        <Camino />
      </div>
    </section>
  );
}
