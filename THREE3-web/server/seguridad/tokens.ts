/** Tokens de enlace de pago: aleatorios, de un solo propósito, y solo se guarda su hash. */
const enHex = (b: ArrayBuffer): string => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const enBase64Url = (b: Uint8Array): string => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function sha256Hex(texto: string): Promise<string> {
  return enHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto)));
}

/** Comparación en tiempo constante para textos de igual formato (hex). */
export function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function nuevoToken(): Promise<{ token: string; hash: string }> {
  const token = enBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  return { token, hash: await sha256Hex(token) };
}

export async function tokenValido(token: string, hash: string): Promise<boolean> {
  if (!token || token.length > 64) return false;
  return iguales(await sha256Hex(token), hash);
}

export async function hmacSha256Hex(secreto: string, mensaje: string): Promise<string> {
  const llave = await crypto.subtle.importKey("raw", new TextEncoder().encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return enHex(await crypto.subtle.sign("HMAC", llave, new TextEncoder().encode(mensaje)));
}
