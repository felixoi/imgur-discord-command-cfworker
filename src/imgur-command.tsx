import {CommandHandler, CommandResponse, createElement, useDescription, useString,} from "slshx";
import {handleImageUpload} from "./imgur-command-commons"

// `Env` contains bindings and is declared in types/env.d.ts
export function imgurCommand(): CommandHandler<Env> {
    useDescription("Upload specified images from urls to Imgur");
    const urls: string = useString("urls", "URLs separated by spaces", {required: true});

    return (interaction, env, ctx) => {
        const urlList: string[] = urls.split(" ");
        console.log(`[INFO] Chat Command used by ${interaction.member?.user.id} to upload ${urlList.length} images`)
        return (handleImageUpload(env, urlList) as CommandResponse)
    }
}
