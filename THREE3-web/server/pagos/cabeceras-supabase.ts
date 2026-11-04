/** Cabeceras para la API REST de Supabase. Las llaves nuevas (sb_secret_…) no son JWT: solo van en `apikey`.
 *  Las llaves antiguas (service_role, JWT) van además como Bearer. */
export function cabecerasSupabase(clave: string, extra: Record<string, string> = {}): Record<string, string> {
  const base: Record<string, string> = { apikey: clave, "Content-Type": "application/json", ...extra };
  if (!clave.startsWith("sb_")) base.Authorization = `Bearer ${clave}`;
  return base;
}
