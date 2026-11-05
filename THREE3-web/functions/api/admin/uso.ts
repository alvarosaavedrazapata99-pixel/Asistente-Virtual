import { almacenResumenUso, manejarAdminUso } from "../../../server/uso/uso.ts";
import { limitadorDe, type Env } from "../../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) =>
  manejarAdminUso(request, { adminToken: env.ADMIN_TOKEN, limitador: limitadorDe(env), ...almacenResumenUso({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }) });
