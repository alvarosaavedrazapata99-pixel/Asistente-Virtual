/** Verifica el desafío de Cloudflare Turnstile en el servidor. Si algo falla, se rechaza (falla cerrada). */
export async function verificarTurnstile(o: { secreto: string; token: string; ip?: string; entorno: string; fetch?: typeof fetch }): Promise<boolean> {
  if (!o.secreto) return o.entorno !== "produccion"; // en desarrollo se permite sin clave; en producción nunca
  if (!o.token || o.token.length > 2048) return false;
  const f = o.fetch ?? fetch;
  try {
    const datos = new URLSearchParams({ secret: o.secreto, response: o.token });
    if (o.ip) datos.set("remoteip", o.ip);
    const r = await f("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: datos });
    if (!r.ok) return false;
    const j = (await r.json()) as { success?: boolean };
    return j.success === true;
  } catch {
    return false;
  }
}
