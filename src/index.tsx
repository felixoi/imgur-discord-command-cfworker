import {createHandler} from "slshx";
import {imgurLinksCommand} from "./imgur-links-command";
import {imgurCommand} from "./imgur-command";
import {imgur} from "./imgur-message-command";
import { captureError } from '@cfworker/sentry';

const handler = createHandler({
  // Replaced by esbuild when bundling, see scripts/build.js (do not edit)
  applicationId: SLSHX_APPLICATION_ID,
  applicationPublicKey: SLSHX_APPLICATION_PUBLIC_KEY,
  applicationSecret: SLSHX_APPLICATION_SECRET,
  testServerId: SLSHX_TEST_SERVER_ID,
  // Add your commands here
  commands: { 'imgur-links': imgurLinksCommand, 'imgur': imgurCommand },
  messageCommands: { "Upload to Imgur": imgur },
});

export default {
  async fetch(request: Request, environment: Env, context: ExecutionContext) {
    // production mode -> report errors to sentry
    if(ENVIRONMENT === "production") {
      try {
        return await handler(request, environment, context);
      } catch (err) {
        const { event_id, posted } = captureError(
            environment.SENTRY_DSN,
            ENVIRONMENT,
            RELEASE,
            err,
            request,
            null
        );
        context.waitUntil(posted);
        return new Response(`Internal server error. Event ID: ${event_id}`, {
          status: 500
        });
      }
    }
    // development mode -> just print errors to console
    else {
      return handler(request, environment, context);
    }
  }
};
