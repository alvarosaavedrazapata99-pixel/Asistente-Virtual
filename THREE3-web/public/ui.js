/* Interfaz compartida: menú móvil, filtros del catálogo, sección activa y botón fijo "Activar". */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Menú móvil
  const burger = $("#burger");
  const menu = $("#menu");
  const setMenu = (abrir) => {
    menu.hidden = !abrir;
    burger.setAttribute("aria-expanded", String(abrir));
    burger.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
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
      $$("#servicios .card").forEach((card) => {
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
