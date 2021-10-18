import {
    ApplicationCommand,
    createSlashCommandHandler,
    Interaction,
    InteractionHandler,
    InteractionResponse,
    InteractionResponseType,
} from "@glenstack/cf-workers-discord-bot";
import {ApplicationCommandOptionType} from "@glenstack/cf-workers-discord-bot/dist/types";

const command: ApplicationCommand = {
    name: "imgur",
    description: "Upload content from an URL to imgur.com!",
    options: [
        {
            type: ApplicationCommandOptionType.STRING,
            name: "url",
            description: "Content URL",
            required: true
        }
    ]
};

function messageDispatcher(userID: string, message: string) {
    return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: `Hey <@${userID}>, ${message}`,
            allowed_mentions: {
                users: [userID],
            },
        }
    }
}

function unknownError(userID: string): any {
    return messageDispatcher(userID, "the imgur upload failed (unknown error)!");
}

const commandHandler: InteractionHandler = async (
    interaction: Interaction
): Promise<InteractionResponse> => {
    const userID = interaction.member.user.id;

    const body1 = {
        refresh_token: `${IMGUR_REFRESH_TOKEN}`,
        client_id: `${IMGUR_CLIENT_ID}`,
        client_secret: `${IMGUR_CLIENT_SECRET}`,
        grant_type: 'refresh_token'
    }
    const init1 = {
        body: JSON.stringify(body1),
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    }
    const response1 = await fetch("https://api.imgur.com/oauth2/token", init1)
    const re1 = new Response(JSON.stringify(await response1.json()), init1)
    const json1: any = await re1.json()

    if(!json1.access_token) {
        return messageDispatcher(userID, "the imgur upload failed (authentication error)!");
    }

    if(!interaction.data || !interaction.data.options) return unknownError(userID);
    const urlOption = interaction.data.options.pop();
    if(!urlOption) return unknownError(userID);

    const body2 = {
        image: urlOption.value
    }
    const init2 = {
        body: JSON.stringify(body2),
        method: "POST",
        headers: {
            "Authorization": `Bearer ${json1.access_token}`,
            "content-type": "application/json;charset=UTF-8",
        },
    }
    const response2 = await fetch("https://api.imgur.com/3/image", init2)
    const re2 = new Response(JSON.stringify(await response2.json()), init2)
    const json2: any = await re2.json()

    if(!json2.success) {
        return messageDispatcher(userID, "the imgur upload failed (upload error)!");
    }

    return messageDispatcher(userID, `the imgur upload has been finished successfully: ${json2.data.link}`);
};

const slashCommandHandler = createSlashCommandHandler({
    applicationID: `${DISCORD_APPLICATION_ID}`,
    applicationSecret: `${DISCORD_APPLICATION_SECRET}`,
    publicKey: `${DISCORD_PUBLIC_KEY}`,
    commands: [[command, commandHandler]],
});

self.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(slashCommandHandler(event.request));
});
