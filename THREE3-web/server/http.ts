const CABECERAS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export const json = (status: number, cuerpo: unknown): Response => new Response(JSON.stringify(cuerpo), { status, headers: CABECERAS });

export const ipDe = (r: Request): string => r.headers.get("CF-Connecting-IP") ?? r.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";

export class ErrorHttp extends Error {
  status: number;
  constructor(status: number, mensaje: string) { super(mensaje); this.status = status; }
}

/** Lee JSON con tope de tamaño. Acepta text/plain (envío sin comprobación previa de CORS) y application/json. */
export async function leerJson(r: Request, maxBytes = 8192): Promise<unknown> {
  const largo = Number(r.headers.get("content-length") ?? "0");
  if (largo > maxBytes) throw new ErrorHttp(413, "payload_grande");
  const texto = await r.text();
  if (texto.length > maxBytes) throw new ErrorHttp(413, "payload_grande");
  try { return JSON.parse(texto); } catch { throw new ErrorHttp(400, "json_invalido"); }
}
