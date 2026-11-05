/* Interfaz compartida: menú móvil, filtros del catálogo, sección activa y botón fijo "Activar". */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Videos livianos del menú: se cargan solo cuando se necesitan (cursor encima o menú abierto), y no con ahorro de datos
  const conexion = navigator.connection;
  const ahorro = !!(conexion && conexion.saveData);
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const poner = (video, v) => {
    if (video.dataset.listo === v) return;
    video.dataset.listo = v;
    video.poster = `/videos/posters/${v}.webp`;
    if (ahorro || reducido) return; // solo la imagen fija
    video.replaceChildren();
    for (const [t, u] of [["video/webm", `/videos/${v}_sm.webm`], ["video/mp4", `/videos/${v}_sm.mp4`]]) {
      const so = document.createElement("source");
      so.src = u; so.type = t; video.append(so);
    }
    video.load();
  };
  const mover = (video, jugar) => { if (ahorro || reducido) return; if (jugar) video.play().catch(() => {}); else video.pause(); };

  // Menú móvil
  const burger = $("#burger");
  const menu = $("#menu");
  let miniaturas = false;
  const abrirMiniaturas = (abrir) => {
    const vs = $$(".mthumb", menu);
    if (abrir && !miniaturas) { vs.forEach((v) => poner(v, v.dataset.v)); miniaturas = true; }
    vs.forEach((v) => mover(v, abrir));
  };

  // Vista previa con video al pasar el cursor por el menú de escritorio
  const prev = $("#navprev");
  if (prev && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const pv = $("video", prev), txt = $("p", prev);
    let t;
    const mostrar = (a) => {
      clearTimeout(t);
      poner(pv, a.dataset.prev);
      txt.textContent = a.dataset.desc || "";
      const r = a.getBoundingClientRect();
      prev.style.left = Math.max(12, Math.min(innerWidth - 252, r.left + r.width / 2 - 120)) + "px";
      prev.hidden = false;
      requestAnimationFrame(() => prev.classList.add("on"));
      mover(pv, true);
    };
    const ocultar = () => { t = setTimeout(() => { prev.classList.remove("on"); prev.hidden = true; mover(pv, false); }, 120); };
    $$(".links a[data-prev]").forEach((a) => {
      a.addEventListener("mouseenter", () => mostrar(a));
      a.addEventListener("focus", () => mostrar(a));
      a.addEventListener("mouseleave", ocultar);
      a.addEventListener("blur", ocultar);
    });
  }
  const setMenu = (abrir) => {
    menu.hidden = !abrir;
    burger.setAttribute("aria-expanded", String(abrir));
    burger.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    abrirMiniaturas(abrir);
  };
  if (burger && menu) {
    burger.addEventListener("click", () => setMenu(menu.hidden));
    menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
    document.addEventListener("click", (e) => !menu.hidden && !e.target.closest("nav") && setMenu(false));
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { setMenu(false); burger.focus(); }
    });
  }

  // Filtros del catálogo
  const chips = $$("[data-filtro]");
  const estado = $("#filtro-estado");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const f = chip.dataset.filtro;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      let n = 0;
      $$("#planes .card").forEach((card) => {
        const ver = f === "todos" || card.dataset.cat === f;
        card.hidden = !ver;
        if (ver) n++;
      });
      if (estado) estado.textContent = `${n} servicios mostrados`;
    }),
  );

  // Sección activa en la navegación
  const links = $$(".links a, #menu a").filter((a) => a.getAttribute("href")?.startsWith("#"));
  const secciones = $$("main section[id]");
  if (links.length && secciones.length) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) =>
            a.getAttribute("href") === `#${e.target.id}` ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"),
          );
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    secciones.forEach((s) => io.observe(s));
  }

  // Botón fijo en móvil: aparece al salir del hero y se oculta en el cierre
  const sticky = $("#sticky");
  const hero = $("#top");
  const final = $("#final");
  if (sticky && hero) {
    let fueraHero = false;
    let enFinal = false;
    const pintar = () => (sticky.hidden = !(fueraHero && !enFinal));
    new IntersectionObserver(([e]) => { fueraHero = !e.isIntersecting; pintar(); }, { rootMargin: "-140px 0px 0px 0px" }).observe(hero);
    if (final) new IntersectionObserver(([e]) => { enFinal = e.isIntersecting; pintar(); }).observe(final);
  }
})();

// ventanas de "Mira cómo funciona": abrir con clic, cerrar con × o tocando fuera
(function () {
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-vm]") : null;
    if (t) { var d = document.getElementById(t.getAttribute("data-vm")); if (d && d.showModal) d.showModal(); return; }
    if (e.target.closest && e.target.closest("[data-vcerrar]")) { var m = e.target.closest("dialog"); if (m) m.close(); return; }
    if (e.target.classList && e.target.classList.contains("vmodal")) e.target.close();
  });
})();
