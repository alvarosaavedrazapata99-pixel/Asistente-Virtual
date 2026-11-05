import { almacenAdminClientes, manejarAdminClientes } from "../../../server/widget/admin.ts";
import { limitadorDe, type Env } from "../../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) =>
  manejarAdminClientes(request, {
    adminToken: env.ADMIN_TOKEN,
    limitador: limitadorDe(env),
    ...almacenAdminClientes({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }),
  });
