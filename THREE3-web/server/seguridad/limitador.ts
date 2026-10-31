/** Límite de envíos por ventana. En producción se respalda en KV de Cloudflare; en pruebas, en memoria. */
export interface Contador {
  incrementar(clave: string, ventanaSeg: number): Promise<number>;
}

export function contadorMemoria(ahora: () => number = Date.now): Contador {
  const m = new Map<string, { n: number; expira: number }>();
  return {
    async incrementar(clave, ventanaSeg) {
      const t = ahora();
      const e = m.get(clave);
      if (!e || e.expira <= t) { m.set(clave, { n: 1, expira: t + ventanaSeg * 1000 }); return 1; }
      e.n++;
      return e.n;
    },
  };
}

type KV = { get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> };

/** KV no es atómico: el límite es aproximado, suficiente contra abuso casual. El límite duro lo da una regla de WAF de Cloudflare. */
export function contadorKV(kv: KV): Contador {
  return {
    async incrementar(clave, ventanaSeg) {
      const actual = Number((await kv.get(clave)) ?? "0") + 1;
      await kv.put(clave, String(actual), { expirationTtl: Math.max(60, ventanaSeg) });
      return actual;
    },
  };
}

export async function dentroDelLimite(c: Contador, clave: string, max: number, ventanaSeg: number): Promise<boolean> {
  return (await c.incrementar(clave, ventanaSeg)) <= max;
}
