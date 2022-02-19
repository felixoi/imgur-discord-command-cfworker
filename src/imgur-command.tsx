import {CommandHandler, CommandResponse, createElement, useAttachment, useDescription} from "slshx";
import type { APIAttachment } from "discord-api-types/v9";
import {handleImageUpload} from "./imgur-command-commons"

// `Env` contains bindings and is declared in types/env.d.ts
export function imgurCommand(): CommandHandler<Env> {
    useDescription("Upload images to Imgur");
    const attachment: APIAttachment = useAttachment("attachment1", "Image to upload",{required: true});
    const attachment2: APIAttachment | null = useAttachment("attachment2", "Image to upload",{required: false});
    const attachment3: APIAttachment | null = useAttachment("attachment3", "Image to upload",{required: false});
    const attachment4: APIAttachment | null = useAttachment("attachment4", "Image to upload",{required: false});
    const attachment5: APIAttachment | null = useAttachment("attachment5", "Image to upload",{required: false});

    return (interaction, env, ctx) => {
        const urlList: string[] = [];
        urlList.push(attachment.url);

        if(attachment2 != null) urlList.push(attachment2.url);
        if(attachment3 != null) urlList.push(attachment3.url);
        if(attachment4 != null) urlList.push(attachment4.url);
        if(attachment5 != null) urlList.push(attachment5.url);

        console.log(`[INFO] Chat Command used by ${interaction.member?.user.id} to upload ${urlList.length} images`)
        return (handleImageUpload(env, urlList) as CommandResponse)
    }
}
