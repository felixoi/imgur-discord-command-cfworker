/// <reference types="node" />
// Registers the slash and message commands with Discord. Run with `npm run register`.
// Commands register to DISCORD_TEST_GUILD_ID instantly when it is set, otherwise globally.
import { register } from "discord-hono";
import * as handlers from "./handlers/index.ts";
import { factory } from "./init.ts";

await register(
  factory.getCommands(Object.values(handlers)),
  process.env.DISCORD_APPLICATION_ID,
  process.env.DISCORD_TOKEN,
  process.env.DISCORD_TEST_GUILD_ID || undefined,
);
