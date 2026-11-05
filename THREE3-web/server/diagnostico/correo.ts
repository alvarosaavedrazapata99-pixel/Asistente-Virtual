import DIAG from "../../public/diagnostico-core.js";

const esc = (v: unknown): string => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export type Resultado = ReturnType<typeof DIAG.evaluar>;
export type Contacto = { nombre: string; negocio: string; email: string; celular: string };
export type Plan = { nombre: string; modulo?: boolean };

export type Correo = { para: string[]; asunto: string; html: string; texto: string; responder?: string };

const nombrePlan = (r: Resultado, planes: Record<string, string>): string => (planes[r.plan] ?? r.plan) + (r.modulo ? " + módulo de leads y CRM" : "");

const caja = (c: string) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b1220">${c}</div>`;

/** Copia del diagnóstico para quien lo hizo. Todo lo que escribió la persona se escapa. */
export function correoCliente(r: Resultado, c: Contacto, o: { sitio: string; whatsapp: string; planes: Record<string, string> }): Correo {
  const wa = o.whatsapp ? `https://wa.me/${o.whatsapp}?text=${encodeURIComponent("Hola THREE3, hice el diagnóstico de mi negocio y quiero conversar.")}` : "";
  const plan = nombrePlan(r, o.planes);
  const lista = r.ganancias.map((g) => `<li style="margin:6px 0">${esc(g)}</li>`).join("");
  const html = caja(`
    <h2 style="margin:0 0 8px">Tu diagnóstico, ${esc(c.nombre.split(" ")[0])}</h2>
    <p style="margin:0 0 16px;color:#44536b">${esc(c.negocio || r.rubroNombre)} · ${esc(r.rubroNombre)}</p>
    <p style="font-size:34px;margin:0"><b>${r.madurez}</b><span style="font-size:16px;color:#44536b"> / 100 de automatización actual</span></p>
    <p>Según tus respuestas, podrías estar dejando sin atender a tiempo cerca de <b>${r.perdidaPct} de cada 100 consultas</b> (unas <b>${r.perdidas} al mes</b>). Es una estimación orientativa, no una garantía.</p>
    <h3>3 mejoras rápidas</h3><ol style="padding-left:20px">${lista}</ol>
    <p><b>Plan sugerido:</b> ${esc(plan)}. El precio final se confirma por escrito.</p>
    ${wa ? `<p><a href="${esc(wa)}" style="background:#FFB300;color:#111;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Conversar con un asesor</a></p>` : ""}
    <p style="font-size:12px;color:#6b7a90">Recibes este correo porque hiciste el diagnóstico en ${esc(o.sitio)}. Si no fuiste tú, ignóralo.</p>`);
  const texto = `Tu diagnóstico, ${c.nombre}\n\nAutomatización actual: ${r.madurez}/100.\nPodrías estar dejando sin atender a tiempo cerca de ${r.perdidaPct} de cada 100 consultas (unas ${r.perdidas} al mes). Estimación orientativa.\n\n3 mejoras rápidas:\n${r.ganancias.map((g, i) => `${i + 1}. ${g}`).join("\n")}\n\nPlan sugerido: ${plan}. El precio final se confirma por escrito.\n${wa ? `\nConversar con un asesor: ${wa}\n` : ""}\nRecibes este correo porque hiciste el diagnóstico en ${o.sitio}.`;
  return { para: [c.email], asunto: `Tu diagnóstico de ${r.rubroNombre} · THREE3`, html, texto };
}

/** Aviso interno para THREE3: quién es, qué tan interesado está y cómo contactarlo. */
export function correoAviso(r: Resultado, c: Contacto, o: { aviso: string; sitio: string; planes: Record<string, string> }): Correo {
  const nivel = (DIAG.NIVEL_TEXTO as Record<string, string>)[r.interes.nivel];
  const tel = c.celular ? c.celular.replace(/\D/g, "") : "";
  const wa = tel ? `https://wa.me/${tel.length === 9 ? "51" + tel : tel}` : "";
  const html = caja(`
    <h2 style="margin:0 0 6px">Nuevo diagnóstico: ${esc(nivel)}</h2>
    <p style="margin:0 0 12px;color:#44536b">${esc(r.interes.puntos)} puntos de interés</p>
    <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
      <tr><td><b>Nombre</b></td><td>${esc(c.nombre)}</td></tr>
      <tr><td><b>Negocio</b></td><td>${esc(c.negocio || "—")} (${esc(r.rubroNombre)})</td></tr>
      <tr><td><b>Celular</b></td><td>${esc(c.celular || "—")}</td></tr>
      <tr><td><b>Correo</b></td><td>${esc(c.email || "—")}</td></tr>
      <tr><td><b>Consultas al mes</b></td><td>≈ ${r.consultas} (podrían quedar sin atender: ~${r.perdidas})</td></tr>
      <tr><td><b>Automatización</b></td><td>${r.madurez}/100</td></tr>
      <tr><td><b>Plan sugerido</b></td><td>${esc(nombrePlan(r, o.planes))}</td></tr>
    </table>
    ${wa ? `<p><a href="${esc(wa)}">Escribirle por WhatsApp</a></p>` : ""}
    <p><a href="${esc(o.sitio)}/admin">Abrir el panel</a></p>`);
  const texto = `Nuevo diagnóstico: ${nivel} (${r.interes.puntos} pts)\n${c.nombre} · ${c.negocio || "—"} (${r.rubroNombre})\nCelular: ${c.celular || "—"}\nCorreo: ${c.email || "—"}\nConsultas/mes: ~${r.consultas} · automatización ${r.madurez}/100\nPlan sugerido: ${nombrePlan(r, o.planes)}\n${wa}\nPanel: ${o.sitio}/admin`;
  return { para: [o.aviso], asunto: `[${nivel}] Diagnóstico de ${c.negocio || c.nombre} (${r.rubroNombre})`, html, texto, responder: c.email || undefined };
}

/** Envío con Resend (https://resend.com). Lanza error si el proveedor rechaza el correo. */
export async function enviarCorreo(cfg: { clave: string; remitente: string; fetch?: typeof fetch }, c: Correo): Promise<void> {
  const f = cfg.fetch ?? fetch;
  const r = await f("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: cfg.remitente, to: c.para, subject: c.asunto, html: c.html, text: c.texto, ...(c.responder ? { reply_to: c.responder } : {}) }),
  });
  if (!r.ok) throw new Error(`correo_${r.status}`);
}
