const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";

export async function retrieveImgurClient(env: Env, refreshToken: string, clientId: string, clientSecret: string):
    Promise<ImgurClient> {

    const accessToken = await env.IMGUR_ACCESS_TOKEN.get(ACCESS_TOKEN_KEY);

    if (accessToken != null) {
        console.log("[INFO] Using cached access token")
        return new ImgurClient(accessToken);
    }

    const body: any = {
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token'
    }
    const init: RequestInit = {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    }

    let response: Response = await fetch("https://api.imgur.com/oauth2/token", init);

    return response.json<ImgurTokenResponse>().then((d: ImgurTokenResponse) => {
        console.log("[INFO] Using fetched access token")
        env.IMGUR_ACCESS_TOKEN.put(ACCESS_TOKEN_KEY, d.access_token, {expirationTtl: d.expires_in - 60})
        return new ImgurClient(d.access_token);
    });
}

export class ImgurClient {

    private readonly accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    public async upload(image: string | string[]): Promise<ImgurAPIResponse<ImageData|ImgurError>
        | ImgurAPIResponse<ImageData|ImgurError>[]> {

        const images = Array.isArray(image) ? image : [image];

        const promises = images.map(i => {
            return new Promise<ImgurAPIResponse<ImageData>>(async resolve => {
                const init: RequestInit = {
                    body: JSON.stringify({image: i}),
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.accessToken}`,
                        "content-type": "application/json;charset=UTF-8",
                    },
                }
                const response: Response = await fetch("https://api.imgur.com/3/image", init)
                resolve(await response.json())
            })
        })

        return Promise.all(promises);
    }

}
