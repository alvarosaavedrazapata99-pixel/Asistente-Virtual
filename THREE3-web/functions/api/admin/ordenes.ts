import { manejarCrearOrden } from "../../../server/pagos/manejadores.ts";
import { depPagos, type Env } from "../../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) => manejarCrearOrden(request, depPagos(env), env.SITE_URL);
