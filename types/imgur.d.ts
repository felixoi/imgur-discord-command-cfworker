interface ImgurTokenResponse {
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
    account_username: string
}

interface ImgurAPIResponse<T> {
    data: T;
    success: boolean;
    status: number;
}

interface ImgurError {
    error: ImgurErrorData;
}

interface ImgurErrorData {
    code: number;
    message: string;
    type: string;
    exception: string[];
}

interface ImageData {
    id: string;
    title: string | undefined;
    description: string | undefined;
    datetime: number;
    type: string;
    animated: boolean;
    width: number;
    height: number;
    size: number;
    views: number;
    bandwidth: number;
    vote: undefined;
    favorite: boolean;
    nsfw: boolean | undefined,
    section: string | undefined,
    account_url: string | undefined,
    account_id: number;
    is_ad: boolean;
    in_most_viral: boolean;
    tags: string[];
    ad_type: number;
    ad_url: string;
    in_gallery: boolean;
    deletehash: string;
    name: string;
    link: string;
}
