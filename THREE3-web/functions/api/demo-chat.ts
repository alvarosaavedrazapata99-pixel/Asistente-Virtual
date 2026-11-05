import { manejarDemoChat } from "../../server/demo/chat.ts";
import { depDemo, type Env } from "../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) => manejarDemoChat(request, depDemo(env));
