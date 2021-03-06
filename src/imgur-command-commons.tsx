import {CommandResponse, createElement, Message} from "slshx";
import {ImgurClient, retrieveImgurClient} from "./imgur-api";

function printImgurErrorObject(imgurResponse: ImgurAPIResponse<ImageData | ImgurError>) {
    throw new Error(`Imgur API returned an error: ${JSON.stringify(imgurResponse)}`)
}

export async function handleImageUpload(env: Env, urls: string[]): Promise<CommandResponse> {
    const api: ImgurClient = await retrieveImgurClient(env,
        env.IMGUR_REFRESH_TOKEN,
        env.IMGUR_CLIENT_ID,
        env.IMGUR_CLIENT_SECRET);

    const response: (ImgurAPIResponse<ImageData | ImgurError> | ImgurAPIResponse<ImageData | ImgurError>[])
        = await api.upload(urls)

    let urlLinks: string;
    let total: number;
    let succeeded = 0;
    if (Array.isArray(response)) {
        total = response.length;
        let urlLinkList: string[] = response.filter(v => v.success).map((v, _, __) =>
            (v.data as ImageData).link
        )
        succeeded = urlLinkList.length;
        urlLinks = urlLinkList.join("\n");

        if (succeeded < total) {
            response.filter(v => !v.success).forEach((v: ImgurAPIResponse<ImageData | ImgurError>) => {
                printImgurErrorObject(v)
            })
        }
    } else {
        total = 1;
        if ((response.data as ImgurError).error) {
            const errorData: ImgurAPIResponse<ImageData | ImgurError> = response
            urlLinks = "";
            printImgurErrorObject(errorData)
        } else {
            urlLinks = (response.data as ImageData).link;
            succeeded++;
        }
    }

    return <Message ephemeral>
        {succeeded == total ? "All" : succeeded == 0 ? "No" : "Some"} images were uploaded successfully
        ({succeeded}/{total}):{"\n"}
        {urlLinks}
    </Message>;
}
