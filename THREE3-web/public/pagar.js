/* Página de pago. Todo el texto de la respuesta se inserta con textContent (nunca innerHTML). El monto lo decide el servidor. */
(() => {
  const raiz = document.getElementById("pay");
  if (!raiz) return;
  const q = new URLSearchParams(location.search);
  const o = q.get("o") || "";
  const t = q.get("t") || "";
  const $ = (id) => document.getElementById(id);
  const estado = $("pay-estado");
  const dinero = (n) => "S/ " + Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const hostMP = (u) => { try { const x = new URL(u); return x.protocol === "https:" && /(^|\.)mercadopago\.com(\.[a-z]{2})?$/.test(x.hostname); } catch { return false; } };

  async function consultar() {
    const r = await fetch(`/api/pagos/orden?o=${encodeURIComponent(o)}&t=${encodeURIComponent(t)}`, { credentials: "omit" });
    if (!r.ok) return null;
    return r.json();
  }

  async function iniciar() {
    const orden = await consultar().catch(() => null);
    if (!orden) { estado.textContent = "No encontramos esta orden. Revisa el enlace que te enviamos o escríbenos."; return; }
    if (orden.estado !== "creado") { estado.textContent = orden.estado === "pagado" ? "Esta orden ya está pagada. Gracias." : "Esta orden ya no admite pagos."; return; }
    $("pay-desc").textContent = orden.descripcion;
    $("pay-monto").textContent = dinero(orden.monto_pen);
    $("pay-datos").hidden = false;
    estado.textContent = "Revisa el detalle y continúa.";
    const btn = $("pay-btn");
    btn.hidden = false;
    btn.onclick = async () => {
      btn.disabled = true; btn.textContent = "Abriendo Mercado Pago…";
      try {
        const r = await fetch("/api/pagos/crear", { method: "POST", credentials: "omit", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ o, t }) });
        const j = await r.json();
        if (r.ok && j.url && hostMP(j.url)) { location.assign(j.url); return; }
        estado.textContent = r.status === 409 ? "Esta orden ya no admite pagos." : "No pudimos abrir el pago. Intenta de nuevo en un momento.";
      } catch { estado.textContent = "No pudimos conectar. Intenta de nuevo."; }
      btn.disabled = false; btn.textContent = "Pagar con Mercado Pago";
    };
  }

  async function esperar() {
    for (let i = 0; i < 12; i++) {
      const orden = await consultar().catch(() => null);
      if (orden && orden.estado !== "creado") {
        $("pay-titulo").textContent = "¡Pago recibido!";
        estado.textContent = "Te escribiremos para coordinar la entrega. Gracias por confiar en THREE3.";
        return;
      }
      await new Promise((r) => setTimeout(r, 2500));
    }
    $("pay-titulo").textContent = "Aún estamos confirmando";
    estado.textContent = "Si el pago fue aprobado, lo verás reflejado en unos minutos y te escribiremos. Guarda tu número de orden: " + o.slice(0, 12) + "…";
  }

  (raiz.getAttribute("data-modo") === "resultado" ? esperar : iniciar)();
})();
