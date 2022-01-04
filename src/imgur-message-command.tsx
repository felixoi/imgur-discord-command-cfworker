import {createElement, Message, MessageCommandHandler} from "slshx";
import {handleImageUpload} from "./imgur-command-commons"

export function imgur(): MessageCommandHandler<Env> {
    return async (interaction, env, ctx, message) => {
        const urls: string[] = message.attachments.map(f => f.url);
        message.embeds.forEach(a => {
            if(a.thumbnail) {
                urls.push(a.thumbnail.url);
            }
        });

        console.log(`[INFO] Message Command used by ${interaction.member?.user.id} to upload ${urls.length} images`)

        if(urls.length == 0) {
            return <Message ephemeral>
                The selected message does not contain attached or embedded images.
            </Message>
        }

        return handleImageUpload(env, urls);
    }
}
