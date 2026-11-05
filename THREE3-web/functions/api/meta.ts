import { manejarMeta } from "../../server/bot/manejador.ts";
import { depBot, type Env } from "../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) => manejarMeta(request, depBot(env));
