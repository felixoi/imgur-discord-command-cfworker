import {
    ApplicationCommand,
    createSlashCommandHandler,
    Interaction,
    InteractionHandler,
    InteractionResponse,
    InteractionResponseType,
} from "@glenstack/cf-workers-discord-bot";
import {ApplicationCommandOptionType} from "@glenstack/cf-workers-discord-bot/dist/types";

/**
 * The command specification.
 */
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

/**
 * Returns an object to message the user who dispatched the command.
 *
 * The complete message always starts with a greeting and a "ping" to
 * to the dispatcher, followed by the message specified by the in the function parameter.
 *
 * @param userID the user id of the command dispatcher
 * @param message the message to follow after the user ping
 */
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

/**
 * Returns an object to message the command dispatcher about an unknown error.
 *
 * @param userID the user id of the command dispatcher
 */
function unknownError(userID: string): any {
    return messageDispatcher(userID, "the imgur upload failed (unknown error)!");
}

/**
 * Authenticates against the imgur api using the refresh token to retrieve an access token.
 */
const retrieveImgurAccessToken: any = async (): Promise<any> => {
    const body = {
        refresh_token: `${IMGUR_REFRESH_TOKEN}`,
        client_id: `${IMGUR_CLIENT_ID}`,
        client_secret: `${IMGUR_CLIENT_SECRET}`,
        grant_type: 'refresh_token'
    }
    const init = {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    }
    const response = await fetch("https://api.imgur.com/oauth2/token", init)

    return response.json();
}

/**
 * The command handler with the logic to upload content from the specified URL to imgur.
 *
 * @param interaction the interaction data
 */
const commandHandler: InteractionHandler = async (
    interaction: Interaction
): Promise<InteractionResponse> => {
    const userID = interaction.member.user.id;
    const authObj = await retrieveImgurAccessToken();

    if(!authObj.access_token) {
        return messageDispatcher(userID, "the imgur upload failed (authentication error)!");
    }

    // Just in case. This should never happen as the command option is marked as required.
    if(!interaction.data || !interaction.data.options) return unknownError(userID);
    const urlOption = interaction.data.options.pop();
    if(!urlOption) return unknownError(userID);

    const body = {
        image: urlOption.value
    }
    const init = {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authObj.access_token}`,
            "content-type": "application/json;charset=UTF-8",
        },
    }
    const response = await fetch("https://api.imgur.com/3/image", init)
    const json: any = await response.json()

    if(!json.success) {
        return messageDispatcher(userID, "the imgur upload failed (upload error)!");
    }

    return messageDispatcher(userID, `the imgur upload has been finished successfully: ${json.data.link}`);
};

/**
 * Builds the slash command handler using the needed secrets, the command specification and the command handler.
 */
const slashCommandHandler = createSlashCommandHandler({
    applicationID: `${DISCORD_APPLICATION_ID}`,
    applicationSecret: `${DISCORD_APPLICATION_SECRET}`,
    publicKey: `${DISCORD_PUBLIC_KEY}`,
    commands: [[command, commandHandler]],
});

/**
 * Adds an event listener for the fetch event to always respond with the slash command handler logic provided by the
 * library.
 */
self.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(slashCommandHandler(event.request));
});
