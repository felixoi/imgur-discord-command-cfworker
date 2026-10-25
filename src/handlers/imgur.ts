import { makeAttachmentOption, makeSlashCommand } from "discord-hono";
import { factory } from "../init.ts";
import { respondWithUpload } from "../lib/respond-with-upload.ts";

const ATTACHMENT_OPTIONS = ["attachment1", "attachment2", "attachment3", "attachment4", "attachment5"] as const;

export const command_imgur = factory.command(
  makeSlashCommand("imgur", "Upload images to Imgur").options(
    ATTACHMENT_OPTIONS.map((name, i) => makeAttachmentOption(name, "Image to upload").required(i === 0)),
  ),
  (c) => {
    // Attachment options hold the attachment ID; the attachment itself is in the resolved data
    const urls = ATTACHMENT_OPTIONS.map((name) => c.var[name])
      .flatMap((id) => (id ? (c.ref.attachments?.[id]?.url ?? []) : []));
    return respondWithUpload(c, urls);
  },
);
