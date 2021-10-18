export {};

/**
 * Bindings for the cloudflare worker secrets used in the code.
 */
declare global {
    /**
     * Id of the registered imgur client.
     */
    const IMGUR_CLIENT_ID: string;
    /**
     * Secret for the registered imgur client.
     */
    const IMGUR_CLIENT_SECRET: string;
    /**
     * Refresh token for the registered imgur client.
     */
    const IMGUR_REFRESH_TOKEN: string;
    /**
     * Id of the registered discord application.
     */
    const DISCORD_APPLICATION_ID: string;
    /**
     * Secret for the registered discord application.
     */
    const DISCORD_APPLICATION_SECRET: string;
    /**
     * Public key of the registered discord application.
     */
    const DISCORD_PUBLIC_KEY: string;
    /**
     * Username for HTTP Basic Authentication.
     */
    const HTTP_BASIC_USER: string;
    /**
     * Password for HTTP Basic Authentication.
     */
    const HTTP_BASIC_PASSWORD: string;
}
