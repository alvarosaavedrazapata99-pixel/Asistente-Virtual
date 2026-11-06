/* THREE3 · bot incrustable. Uso: <script src="https://www.three3agency.com/widget.js" data-cliente="mi-negocio" defer></script>
   Sin cookies ni almacenamiento local. Los estilos viven en un Shadow DOM para no chocar con la página. */
(() => {
  const s = document.currentScript || document.querySelector("script[data-cliente][src*='widget.js']");
  if (!s || window.__three3Widget) return;
  const id = (s.getAttribute("data-cliente") || "").trim();
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return;
  window.__three3Widget = true;
  const base = new URL(s.src).origin;
  const api = (a) => `${base}/api/widget?c=${encodeURIComponent(id)}&a=${a}`;
  const post = (a, cuerpo) => fetch(api(a), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo), credentials: "omit" });

  fetch(api("config"), { credentials: "omit" })
    .then((r) => (r.ok ? r.json() : null))
    .then((c) => { if (c && c.ok) iniciar(c); })
    .catch(() => {});

  function iniciar(c) {
    const color = /^#[0-9a-fA-F]{6}$/.test(c.color) ? c.color : "#1E6BFF";
    const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const host = document.createElement("div");
    host.setAttribute("data-three3-widget", id);
    const sh = host.attachShadow({ mode: "open" });
    sh.innerHTML = `
<style>
:host{all:initial}
*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.l{position:fixed;right:16px;bottom:16px;z-index:2147483000;width:56px;height:56px;border-radius:50%;border:0;background:${color};color:#fff;font-size:26px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.28)}
.p{position:fixed;right:16px;bottom:84px;z-index:2147483000;width:min(380px,calc(100vw - 32px));height:min(540px,calc(100dvh - 110px));background:#fff;color:#111;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.3);display:flex;flex-direction:column;overflow:hidden}
.p[hidden]{display:none}
.h{background:${color};color:#fff;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.h b{display:block;font-size:15px}.h small{font-size:11px;opacity:.9}
.x{background:transparent;border:0;color:#fff;font-size:22px;cursor:pointer;min-width:44px;min-height:44px}
.g{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f5f7fb}
.m{max-width:85%;padding:9px 12px;border-radius:14px;font-size:14.5px;line-height:1.4;overflow-wrap:anywhere;white-space:pre-wrap}
.m.b{align-self:flex-start;background:#fff;border:1px solid #e3e7ef}
.m.u{align-self:flex-end;background:${color};color:#fff}
.m.t{opacity:.7;font-style:italic}
form{display:flex;gap:6px;padding:8px;border-top:1px solid #e3e7ef;background:#fff}
input[type=text],input[type=email]{flex:1;min-width:0;border:1px solid #cfd6e4;border-radius:10px;padding:11px;font-size:16px}
button.e{border:0;background:${color};color:#fff;border-radius:10px;padding:0 14px;font-size:14px;min-height:44px;cursor:pointer}
.f{display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between;align-items:center;padding:6px 10px 10px;background:#fff;font-size:12px;color:#555}
.f a,.f button{color:${color};background:none;border:0;padding:6px 0;font-size:12px;cursor:pointer;text-decoration:underline}
.d{display:grid;gap:8px;padding:10px;background:#fff;border-top:1px solid #e3e7ef;font-size:13px}
.d[hidden]{display:none}.d label{display:flex;gap:6px;align-items:flex-start}
.d p{margin:0;color:#444}
@media (prefers-reduced-motion:no-preference){.p{animation:s .18s ease-out}@keyframes s{from{opacity:0;transform:translateY(8px)}}}
</style>
<button class="l" aria-label="Abrir chat" aria-expanded="false">💬</button>
<section class="p" role="dialog" aria-label="Chat" hidden>
  <div class="h"><div><b></b><small>Asistente virtual con IA · THREE3</small></div><button class="x" aria-label="Cerrar chat">×</button></div>
  <div class="g" role="log" aria-live="polite"></div>
  <form class="chat"><input type="text" maxlength="300" aria-label="Escribe tu mensaje" placeholder="Escribe tu mensaje…" autocomplete="off"><button class="e" type="submit">Enviar</button></form>
  <form class="d" hidden>
    <p></p>
    <input type="text" name="nombre" maxlength="120" aria-label="Tu nombre" placeholder="Tu nombre" autocomplete="name" required>
    <input type="text" name="contacto" maxlength="120" aria-label="Correo o celular" placeholder="Correo o celular" autocomplete="off" required>
    <label><input type="checkbox" name="ok"><span></span></label>
    <button class="e" type="submit">Enviar mis datos</button>
  </form>
  <div class="f"><button type="button" class="dato">Dejar mis datos</button><span class="hum"></span></div>
</section>`;
    const q = (x) => sh.querySelector(x);
    const lanz = q(".l"), panel = q(".p"), log = q(".g"), chat = q(".chat"), inp = q(".chat input"), dat = q(".d"), btnDato = q(".dato");
    q(".h b").textContent = c.nombre; lanz.setAttribute("aria-label", "Abrir chat con " + c.nombre);
    q(".d p").textContent = "Déjanos tus datos y una persona te contactará.";
    q(".d label span").textContent = `Autorizo que ${c.nombre} use estos datos para contactarme.`;
    if (c.whatsapp) {
      const a = document.createElement("a");
      a.href = "https://wa.me/" + c.whatsapp; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Hablar con una persona";
      q(".hum").append(a);
    }
    if (!c.ia) { chat.hidden = true; dat.hidden = false; btnDato.hidden = true; }

    const hist = [];
    const burbuja = (rol, texto, extra) => {
      const m = document.createElement("div");
      m.className = "m " + (rol === "usuario" ? "u" : "b") + (extra ? " " + extra : "");
      m.textContent = texto;
      log.append(m); log.scrollTop = log.scrollHeight;
      if (!extra) hist.push({ rol, texto });
      return m;
    };
    const abrir = (v) => {
      panel.hidden = !v; lanz.setAttribute("aria-expanded", String(v));
      if (v) { if (!hist.length) burbuja("bot", c.saludo || "¡Hola! ¿En qué te ayudo?"); (c.ia ? inp : sh.querySelector(".d input")).focus({ preventScroll: true }); } else lanz.focus();
    };
    lanz.addEventListener("click", () => abrir(panel.hidden));
    q(".x").addEventListener("click", () => abrir(false));
    sh.addEventListener("keydown", (e) => { if (e.key === "Escape") abrir(false); });
    btnDato.addEventListener("click", () => { dat.hidden = !dat.hidden; });

    chat.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = inp.value.trim().slice(0, 300);
      if (!v) return;
      inp.value = ""; burbuja("usuario", v);
      const t = burbuja("bot", "escribiendo…", "t");
      let texto = "Ahora no puedo responder. Déjanos tus datos y te contactamos.";
      try {
        const r = await post("chat", { mensajes: hist.slice(-8) });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.texto) texto = j.texto;
        else if (r.status === 429) texto = "Hoy recibimos muchas consultas. Déjanos tus datos y te contactamos.";
      } catch {}
      t.remove(); burbuja("bot", texto);
    });

    dat.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = new FormData(dat);
      const contacto = String(f.get("contacto") || "").trim();
      if (!f.get("ok")) { burbuja("bot", "Necesitamos tu autorización para contactarte.", "t"); return; }
      const cuerpo = { nombre: String(f.get("nombre") || "").trim(), detalle: hist.filter((h) => h.rol === "usuario").map((h) => h.texto).join(" | ").slice(0, 500), consentimiento: true };
      if (contacto.includes("@")) cuerpo.email = contacto; else cuerpo.celular = contacto;
      let ok = false;
      try { ok = (await post("lead", cuerpo)).ok; } catch {}
      dat.hidden = true; dat.reset();
      burbuja("bot", ok ? "¡Gracias! Recibimos tus datos y una persona te contactará." : "No pudimos guardar tus datos. Intenta de nuevo o escríbenos por otro medio.");
    });
    document.body.append(host);
  }
})();
