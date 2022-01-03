import {authorizeResponse, createHandler} from "slshx";
import { imgurCommand } from "./imgur-command";
import { imgur } from "./imgur-message-command";

const handler = createHandler({
  // Replaced by esbuild when bundling, see scripts/build.js (do not edit)
  applicationId: SLSHX_APPLICATION_ID,
  applicationPublicKey: SLSHX_APPLICATION_PUBLIC_KEY,
  applicationSecret: SLSHX_APPLICATION_SECRET,
  testServerId: SLSHX_TEST_SERVER_ID,
  // Add your commands here
  commands: { imgur: imgurCommand },
  messageCommands: { "Upload to Imgur": imgur },
});

export default { fetch: handler };
