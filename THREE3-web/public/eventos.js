/* Medición anónima de /ig: una visita por carga y un clic por enlace. Sin cookies ni datos personales. */
(() => {
  const raiz = document.querySelector("[data-endpoint]");
  const url = raiz && raiz.getAttribute("data-endpoint");
  if (!url) return;
  const q = new URLSearchParams(location.search);
  const base = () => ({
    pagina: location.pathname,
    utm_source: q.get("utm_source") || "instagram",
    utm_medium: q.get("utm_medium") || "bio",
    utm_campaign: q.get("utm_campaign") || raiz.getAttribute("data-campana") || "",
    dispositivo: matchMedia("(pointer: coarse)").matches ? "movil" : "escritorio",
  });
  const enviar = (tipo, evento) => {
    // fetch con keepalive: se completa aunque la persona cambie de página al tocar el enlace.
    fetch(url, {
      method: "POST", body: JSON.stringify({ tipo, evento, ...base() }),
      headers: { "Content-Type": "text/plain;charset=utf-8" }, keepalive: true, credentials: "omit",
    }).catch(() => {});
  };
  enviar("vista", raiz.getAttribute("data-vista") || "ig");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-ev]");
    if (a) enviar("click", a.getAttribute("data-ev"));
  });
})();
