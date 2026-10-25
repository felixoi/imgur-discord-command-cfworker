import { bindings, defineConfig, triggers } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "imgur-discord-command",
    entrypoint,
    compatibilityDate: "2026-10-01",
    workersDev: false,
    triggers: [
      triggers.fetch({ pattern: "imgur-upload-discord.felixoi.com/*", zone: "felixoi.com" }),
    ],
    observability: {
      enabled: true,
      traces: { enabled: true },
    },
    env: {
      // Caches the short-lived Imgur access token
      IMGUR_ACCESS_TOKEN: bindings.kv({ id: "485ddb5809a6467d97753353c6bd1dc0" }),
      DISCORD_APPLICATION_ID: bindings.secret(),
      DISCORD_PUBLIC_KEY: bindings.secret(),
      // discord-hono needs the bot token to edit deferred replies
      DISCORD_TOKEN: bindings.secret(),
      IMGUR_CLIENT_ID: bindings.secret(),
      IMGUR_CLIENT_SECRET: bindings.secret(),
      IMGUR_REFRESH_TOKEN: bindings.secret(),
    },
  },
});
