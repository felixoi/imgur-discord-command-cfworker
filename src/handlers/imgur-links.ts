import { makeSlashCommand, makeStringOption } from "discord-hono";
import { factory } from "../init.ts";
import { respondWithUpload } from "../lib/respond-with-upload.ts";

export const command_imgur_links = factory.command(
  makeSlashCommand("imgur-links", "Upload images from URLs to Imgur").options([
    makeStringOption("urls", "URLs separated by spaces").required(true),
  ]),
  (c) => respondWithUpload(c, c.var.urls.split(/\s+/).filter(Boolean)),
);
