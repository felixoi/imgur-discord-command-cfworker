import { createFactory } from "discord-hono";

export type AppEnv = { Bindings: Env };

export const factory = createFactory<AppEnv>();
