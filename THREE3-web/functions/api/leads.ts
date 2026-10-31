import { manejarLead } from "../../server/leads/registrar.ts";
import { depLeads, type Env } from "../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) => manejarLead(request, depLeads(env));
