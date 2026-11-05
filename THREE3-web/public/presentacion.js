/* Presentación: navegación, impresión y personalización. Los datos del cliente vienen de sessionStorage (los deja el panel privado), nunca de la dirección. */
(() => {
  const slides = [...document.querySelectorAll("[data-slide]")];
  const cnt = document.getElementById("deck-cnt");
  let datos = null;
  try { datos = JSON.parse(sessionStorage.getItem("deck") || "null"); } catch {}

  if (datos && typeof datos === "object") {
    const negocio = String(datos.negocio || "").slice(0, 120);
    const nombre = String(datos.nombre || "").slice(0, 120);
    const para = document.getElementById("deck-para");
    if (para) para.textContent = negocio ? `Preparada para ${negocio}` : nombre ? `Preparada para ${nombre}` : para.textContent;
    const detalle = String(datos.detalle || "").trim().slice(0, 600);
    if (detalle) {
      document.getElementById("deck-detalle").textContent = detalle;
      document.getElementById("deck-contaste-t").textContent = nombre ? `${nombre.split(" ")[0]}, esto es lo que nos contaste` : "Esto es lo que nos contaste";
      document.getElementById("deck-contaste").hidden = false;
    }
    const plan = document.querySelector(`[data-plan="${CSS.escape(String(datos.servicio || ""))}"]`);
    if (plan) {
      plan.querySelector("[data-reco]").hidden = false;
      plan.classList.add("hot");
      document.getElementById("deck-plan-t").textContent = "Tu plan sugerido";
    }
  }

  const visibles = () => slides.filter((s) => !s.hidden);
  const actual = () => {
    const v = visibles();
    const mitad = innerHeight / 2;
    return Math.max(0, v.findIndex((s) => { const r = s.getBoundingClientRect(); return r.top <= mitad && r.bottom > mitad; }));
  };
  const ir = (i) => { const v = visibles(); const s = v[Math.min(v.length - 1, Math.max(0, i))]; if (s) s.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  const marcar = () => { const v = visibles(); cnt.textContent = `${actual() + 1} / ${v.length}`; };

  document.getElementById("deck-prev").addEventListener("click", () => ir(actual() - 1));
  document.getElementById("deck-next").addEventListener("click", () => ir(actual() + 1));
  document.getElementById("deck-print").addEventListener("click", () => print());
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); ir(actual() + 1); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); ir(actual() - 1); }
  });
  addEventListener("scroll", marcar, { passive: true });
  marcar();
})();
