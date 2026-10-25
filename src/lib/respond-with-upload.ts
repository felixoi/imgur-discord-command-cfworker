import type { CommandContext } from "discord-hono";
import { uploadImages, type UploadResult } from "./imgur.ts";
import type { AppEnv } from "../init.ts";

// Discord rejects message content longer than this
const MAX_CONTENT_LENGTH = 2000;

function formatResults(results: UploadResult[]): string {
  const uploaded = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  const summary = failed.length === 0 ? "All" : uploaded.length === 0 ? "No" : "Some";

  const lines = [
    `${summary} images were uploaded successfully (${uploaded.length}/${results.length}):`,
    ...uploaded.map((r) => r.link),
    ...failed.map((r) => `Failed: <${r.source}> (${r.error})`),
  ];
  const content = lines.join("\n");
  return content.length > MAX_CONTENT_LENGTH ? `${content.slice(0, MAX_CONTENT_LENGTH - 1)}…` : content;
}

/**
 * Defers the interaction (Imgur often takes longer than Discord's 3 second limit),
 * uploads the images, and edits the ephemeral reply with the resulting links.
 */
export function respondWithUpload(c: CommandContext<AppEnv>, sources: string[]): Response {
  const user = c.interaction.member?.user ?? c.interaction.user;
  console.log(`[INFO] "${c.ref.key}" used by ${user?.id} to upload ${sources.length} images`);

  return c.flags("EPHEMERAL").resDefer(async (c) => {
    try {
      await c.followup(formatResults(await uploadImages(c.env, sources)));
    } catch (err) {
      console.error(err);
      await c.followup("Uploading to Imgur failed. Please try again later.");
    }
  });
}
