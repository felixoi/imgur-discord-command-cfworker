const API_BASE = "https://api.imgur.com";
const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  status: number;
}

interface ImageData {
  id: string;
  link: string;
}

interface ErrorData {
  error: string | { message: string };
}

export type UploadResult =
  | { source: string; ok: true; link: string }
  | { source: string; ok: false; error: string };

/** Returns a cached access token, or trades the refresh token for a new one. */
async function getAccessToken(env: Env): Promise<string> {
  const cached = await env.IMGUR_ACCESS_TOKEN.get(ACCESS_TOKEN_KEY);
  if (cached) return cached;

  const response = await fetch(`${API_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      refresh_token: env.IMGUR_REFRESH_TOKEN,
      client_id: env.IMGUR_CLIENT_ID,
      client_secret: env.IMGUR_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) {
    throw new Error(`Imgur token refresh failed (${response.status}): ${await response.text()}`);
  }

  const token = await response.json<TokenResponse>();
  // KV requires a TTL of at least 60 seconds
  await env.IMGUR_ACCESS_TOKEN.put(ACCESS_TOKEN_KEY, token.access_token, {
    expirationTtl: Math.max(60, token.expires_in - 60),
  });
  return token.access_token;
}

async function uploadImage(accessToken: string, source: string): Promise<UploadResult> {
  const response = await fetch(`${API_BASE}/3/image`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ image: source, type: "url" }),
  });

  const body = await response.json<ApiResponse<ImageData | ErrorData>>().catch(() => null);
  if (body?.success && "link" in body.data) {
    return { source, ok: true, link: body.data.link };
  }

  const error = body && "error" in body.data ? body.data.error : undefined;
  const message = typeof error === "string" ? error : error?.message ?? `HTTP ${response.status}`;
  console.error(`[imgur] Upload of ${source} failed: ${message}`);
  return { source, ok: false, error: message };
}

/** Uploads every URL to Imgur. Individual failures are returned, not thrown. */
export async function uploadImages(env: Env, sources: string[]): Promise<UploadResult[]> {
  const accessToken = await getAccessToken(env);
  return Promise.all(sources.map((source) => uploadImage(accessToken, source)));
}
