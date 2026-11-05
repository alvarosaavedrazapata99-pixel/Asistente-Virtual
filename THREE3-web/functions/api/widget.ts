import { manejarWidget } from "../../server/widget/chat.ts";
import { depWidget, type Env } from "../_lib/deps.ts";

export const onRequest = ({ request, env }: { request: Request; env: Env }) => manejarWidget(request, depWidget(env));
