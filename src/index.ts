import {
    ApplicationCommand,
    createSlashCommandHandler,
    Interaction,
    InteractionHandler,
    InteractionResponse,
    InteractionResponseType,
} from "@glenstack/cf-workers-discord-bot";
import {ApplicationCommandOptionType} from "@glenstack/cf-workers-discord-bot/dist/types";
import {basicAuthentication, verifyCredentials, BadRequestException, AuthData} from "./auth";

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
function messageDispatcher(userID: string, message: string): InteractionResponse {
    return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: `${message}`,
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
function unknownError(userID: string): InteractionResponse {
    return messageDispatcher(userID, `<@${userID}>, the imgur upload failed (unknown error)!`);
}

/**
 * Authenticates against the imgur api using the refresh token to retrieve an access token.
 */
const retrieveImgurAccessToken: any = async (): Promise<any> => {
    const body: any = {
        refresh_token: `${IMGUR_REFRESH_TOKEN}`,
        client_id: `${IMGUR_CLIENT_ID}`,
        client_secret: `${IMGUR_CLIENT_SECRET}`,
        grant_type: 'refresh_token'
    }
    const init: RequestInitializerDict = {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    }
    const response: Response = await fetch("https://api.imgur.com/oauth2/token", init)

    return response.json();
}

/**
 * The command handler with the logic to upload content from the specified URL to imgur.
 *
 * @param interaction the interaction data
 */
const commandHandler: InteractionHandler = async (interaction: Interaction): Promise<InteractionResponse> => {
    const userID: string = interaction.member.user.id;
    const authObj: any = await retrieveImgurAccessToken();

    if(!authObj.access_token) {
        return messageDispatcher(userID, `<@${userID}>, the imgur upload failed (authentication error)!`);
    }

    // Just in case. This should never happen as the command option is marked as required.
    if(!interaction.data || !interaction.data.options) return unknownError(userID);
    const urlOption = interaction.data.options.pop();
    if(!urlOption) return unknownError(userID);

    const body: any = {
        image: urlOption.value
    }
    const init: RequestInitializerDict = {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authObj.access_token}`,
            "content-type": "application/json;charset=UTF-8",
        },
    }
    const response: Response = await fetch("https://api.imgur.com/3/image", init)
    const json: any = await response.json()

    if(!json.success) {
        return messageDispatcher(userID, `<@${userID}>, the imgur upload failed (upload error)!`);
    }

    return messageDispatcher(userID, `${json.data.link}`);
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
 * Handles the incoming HTTP request and executes the required logic for the different routes.
 *
 * Modified code from https://developers.cloudflare.com/workers/examples/basic-auth
 * Copyright (c) 2021 Cloudflare, Inc.
 * License: https://github.com/cloudflare/cloudflare-docs/blob/8be04aec617170d777ef7d0e3e001f5d6eb1e60f/LICENSE
 *
 * @param {Request} request Incoming HTTP request
 * @returns {Promise<Response>} Promise of the response to answer the request
 */
async function handleRequest(request: Request): Promise<Response> {
    const { protocol, pathname } = new URL(request.url)

    // In the case of a "Basic" authentication, the exchange
    // MUST happen over an HTTPS (TLS) connection to be secure.
    if ('https:' !== protocol || 'https' !== request.headers.get('x-forwarded-proto')) {
        throw BadRequestException('Please use a HTTPS connection.')
    }

    switch (pathname) {
        case '/favicon.ico':
        case '/robots.txt':
            return new Response(null, { status: 204 })
        case '/interaction':
            return slashCommandHandler(request);
        default:
            if (request.headers.has('Authorization')) {
                // Throws exception when authorization fails.
                const { user, pass }: AuthData = basicAuthentication(request)
                verifyCredentials(user, pass)

                // Only returns this response when no exception is thrown.
                return slashCommandHandler(request);
            }

            // Not authenticated.
            return new Response('You need to login.', {
                status: 401,
                headers: {
                    // Prompts the user for credentials.
                    'WWW-Authenticate': 'Basic realm="login", charset="UTF-8"'
                }
            })
    }
}


/**
 * Adds an event listener to the fetch event to execute the program logic on site fetch.
 *
 * Unmodified code from https://developers.cloudflare.com/workers/examples/basic-auth
 * Copyright (c) 2021 Cloudflare, Inc.
 * License: https://github.com/cloudflare/cloudflare-docs/blob/8be04aec617170d777ef7d0e3e001f5d6eb1e60f/LICENSE
 */
self.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(
        handleRequest(event.request).catch(err => {
            const message = err.reason || err.stack || 'Unknown Error'

            return new Response(message, {
                status: err.status || 500,
                statusText: err.statusText || null,
                headers: {
                    'Content-Type': 'text/plain;charset=UTF-8',
                    // Disables caching by default.
                    'Cache-Control': 'no-store',
                    // Returns the "Content-Length" header for HTTP HEAD requests.
                    'Content-Length': message.length,
                }
            })
        })
    )
});
