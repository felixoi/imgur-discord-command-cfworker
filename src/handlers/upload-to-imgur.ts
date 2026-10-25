import { makeMessageCommand } from "discord-hono";
import { factory } from "../init.ts";
import { respondWithUpload } from "../lib/respond-with-upload.ts";

export const command_upload_to_imgur = factory.command(
  makeMessageCommand("Upload to Imgur"),
  (c) => {
    const message = c.ref.messages?.[c.ref.target_id];
    const urls = new Set([
      ...(message?.attachments.map((a) => a.url) ?? []),
      ...(message?.embeds.flatMap((e) => [e.image?.url, e.thumbnail?.url]) ?? []),
    ]);
    urls.delete(undefined);

    if (urls.size === 0) {
      return c.flags("EPHEMERAL").res("The selected message does not contain attached or embedded images.");
    }
    return respondWithUpload(c, [...urls] as string[]);
  },
);
