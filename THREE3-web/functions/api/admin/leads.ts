import { almacenAdminLeads, manejarAdminLeads } from "../../../server/leads/admin.ts";
import { limitadorDe, type Env } from "../../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) =>
  manejarAdminLeads(request, {
    adminToken: env.ADMIN_TOKEN,
    limitador: limitadorDe(env),
    ...almacenAdminLeads({ url: env.SUPABASE_URL, clave: env.SUPABASE_SERVICE_KEY }),
  });
