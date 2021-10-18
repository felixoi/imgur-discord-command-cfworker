# imgur-discord-command-cfworker

Discord slash-command for uploading content from an url to [Imgur](https://imgur.com).   
Deployable on Cloudflare Workers.

## How to use

1. Clone this repository
2. [Generate a new Cloudflare api key](https://support.cloudflare.com/hc/de/articles/200167836-Verwaltung-von-API-Token-und-Schl%C3%BCsseln) with the `Workers Scripts: Edit` permission
3. [Add the Cloudflare api token as an Github Actions secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) named `CF_API_TOKEN`.
4. [Configure the secrets](https://developers.cloudflare.com/workers/platform/environment-variables) described below for the cloudflare worker
5. Dispatch the Github Action `Deploy` manually
6. Wait for a successful deployment...
7. In the Discord Developer Portal set the application `Interactions Endpoint URL` to `${WORKER_URL}/interaction` (e.g. `https://my-discord-bot.workers.dev/interaction`)
8. Open `${WORKER_URL}/setup` in your browser (this needs to be done every time the command is updated)
9. Open `${WORKER_URL}` in your browser and add the integration to the discord server of your choice
10. Use `/imgur url` on the discord server to easily upload content from the specified url to imgur.

| Worker Secret                | Source |
|------------------------------|----- |
| `IMGUR_CLIENT_ID`            | https://api.imgur.com/oauth2/addclient (OAuth 2 authorization without a callback URL) |
| `IMGUR_CLIENT_SECRET`        | https://api.imgur.com/oauth2/addclient (OAuth 2 authorization without a callback URL) |
| `IMGUR_REFRESH_TOKEN`        | https://api.imgur.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=token (the refresh token can be found in the url after authorisation) |
| `DISCORD_APPLICATION_ID`     | https://discord.com/developers/applications/ (Tab: General Information) |
| `DISCORD_APPLICATION_SECRET` | https://discord.com/developers/applications/ (Tab: OAuth2, named Client Secret) |
| `DISCORD_PUBLIC_KEY`         | https://discord.com/developers/applications/ (Tab: General Information) |
