import { manejarDiagnostico } from "../../server/diagnostico/registrar.ts";
import { depDiagnostico, type Env } from "../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) => manejarDiagnostico(request, depDiagnostico(env));
