import {
    createSlashCommandHandler,
    ApplicationCommand,
    InteractionHandler,
    Interaction,
    InteractionResponse,
    InteractionResponseType,
} from "@glenstack/cf-workers-discord-bot";

const helloCommand: ApplicationCommand = {
    name: "hello",
    description: "Bot will say hello to you!",
};

const helloHandler: InteractionHandler = async (
    interaction: Interaction
): Promise<InteractionResponse> => {
    const userID = interaction.member.user.id;

    return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: `Hello, <@${userID}>!`,
            allowed_mentions: {
                users: [userID],
            },
        },
    };
};

const slashCommandHandler = createSlashCommandHandler({
    applicationID: "799627301675466772",
    applicationSecret: APPLICATION_SECRET, // You should store this in a secret
    publicKey: "1b780f7f71ac39645d44cc4dce8fa78c860d0157cb0912d755b7a7cb95394532",
    commands: [[helloCommand, helloHandler]],
});

addEventListener("fetch", (event) => {
    event.respondWith(slashCommandHandler(event.request));
});