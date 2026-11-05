/* Páginas /mas/...: el video se reproduce cuando es visible; versión liviana en celular o con ahorro de datos. */
(function () {
  var c = navigator.connection;
  if (matchMedia("(max-width:640px)").matches || (c && c.saveData)) {
    document.querySelectorAll("video source").forEach(function (x) { x.src = x.getAttribute("src").replace(/(\.(webm|mp4))$/, "_sm$1"); x.parentNode.load(); });
  }
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vs = document.querySelectorAll("video");
  if (rm) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.play().catch(function () {}); else e.target.pause(); }); }, { threshold: 0.4 });
  vs.forEach(function (v) { io.observe(v); });
})();
