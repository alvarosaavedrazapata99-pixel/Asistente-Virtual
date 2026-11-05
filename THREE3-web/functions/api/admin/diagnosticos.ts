import { almacenAdminDiag, manejarAdminDiagnosticos } from "../../../server/diagnostico/admin.ts";
import { limitadorDe, type Env } from "../../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) =>
  manejarAdminDiagnosticos(request, { adminToken: env.ADMIN_TOKEN, limitador: limitadorDe(env), ...almacenAdminDiag({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }) });
