import {createElement, Message, MessageCommandHandler} from "slshx";
import {handleImageUpload} from "./imgur-command-commons"

export function printErrorMessage(errorData: ImgurErrorData) {
    console.log(`[ERROR] (${errorData.type}) ${errorData.message}`)
}

export function imgur(): MessageCommandHandler<Env> {
    return async (interaction, env, ctx, message) => {
        const urls: string[] = message.attachments.map(f => f.url);
        message.embeds.forEach(a => {
            if(a.thumbnail) {
                urls.push(a.thumbnail.url);
            }
        });

        if(urls.length == 0) {
            return <Message ephemeral>
                The selected message does not contain attached or embedded images.
            </Message>
        }

        return handleImageUpload(env, urls);
    }
}
