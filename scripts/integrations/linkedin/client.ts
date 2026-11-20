import type { LinkedInConfig } from "./config.js";
import type {
  LinkedInLiteProfile,
  LinkedInPost,
  LinkedInPostsPage,
  LinkedInTokenResponse,
  LinkedInUserInfo,
} from "./types.js";

export class LinkedInApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`LinkedIn API ${status}: ${body}`);
    this.name = "LinkedInApiError";
    this.status = status;
    this.body = body;
  }
}

export class LinkedInClient {
  private readonly config: LinkedInConfig;

  constructor(config: LinkedInConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    options: RequestInit & { rest?: boolean } = {},
  ): Promise<T> {
    const accessToken = this.config.accessToken;
    if (!accessToken) {
      throw new Error("Access token required. Run npm run linkedin:auth first.");
    }

    const url = `${this.config.apiBaseUrl}${path}`;
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);

    if (options.rest) {
      headers.set("Linkedin-Version", this.config.apiVersion);
      headers.set("X-Restli-Protocol-Version", "2.0.0");
    }

    const response = await fetch(url, { ...options, headers });
    const body = await response.text();

    if (!response.ok) {
      throw new LinkedInApiError(response.status, body);
    }

    return body ? (JSON.parse(body) as T) : ({} as T);
  }

  /** OpenID Connect userinfo — always available with openid profile email scopes. */
  async fetchUserInfo(): Promise<LinkedInUserInfo> {
    return this.request<LinkedInUserInfo>("/v2/userinfo");
  }

  /**
   * Lite profile. Additional fields (headline, vanityName) require partner scopes.
   * @see https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
   */
  async fetchLiteProfile(): Promise<LinkedInLiteProfile> {
    return this.request<LinkedInLiteProfile>(
      "/v2/me?projection=(id,localizedFirstName,localizedLastName,localizedHeadline,vanityName,profilePicture(displayImage~:playableStreams))",
    );
  }

  /**
   * Member-authored posts and articles.
   * Requires r_member_social (restricted — see EXTERNAL.md).
   */
  async fetchMemberPosts(options?: {
    start?: number;
    count?: number;
    viewContext?: "AUTHOR" | "READER";
  }): Promise<LinkedInPostsPage> {
    const memberUrn = this.config.memberUrn;
    if (!memberUrn) {
      throw new Error("LINKEDIN_MEMBER_URN is required for posts. Set it after OAuth.");
    }

    const params = new URLSearchParams({
      q: "author",
      author: memberUrn,
      viewContext: options?.viewContext ?? "AUTHOR",
      start: String(options?.start ?? 0),
      count: String(options?.count ?? this.config.articlesPageSize),
    });

    return this.request<LinkedInPostsPage>(`/rest/posts?${params.toString()}`, {
      method: "GET",
      headers: {
        "X-RestLi-Method": "FINDER",
      },
      rest: true,
    });
  }

  /** Paginate all member posts until exhausted or maxPages reached. */
  async fetchAllMemberPosts(maxPages = 20): Promise<LinkedInPost[]> {
    const posts: LinkedInPost[] = [];
    let start = 0;
    const count = this.config.articlesPageSize;

    for (let page = 0; page < maxPages; page += 1) {
      const response = await this.fetchMemberPosts({ start, count });
      const elements = response.elements ?? [];
      posts.push(...elements);

      if (elements.length < count) {
        break;
      }

      start += count;
    }

    return posts;
  }

  async exchangeAuthorizationCode(code: string): Promise<LinkedInTokenResponse> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(`${this.config.oauthBaseUrl}/accessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new LinkedInApiError(response.status, text);
    }

    return JSON.parse(text) as LinkedInTokenResponse;
  }

  async refreshAccessToken(): Promise<LinkedInTokenResponse> {
    if (!this.config.refreshToken) {
      throw new Error("LINKEDIN_REFRESH_TOKEN is required to refresh the access token.");
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: this.config.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(`${this.config.oauthBaseUrl}/accessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new LinkedInApiError(response.status, text);
    }

    return JSON.parse(text) as LinkedInTokenResponse;
  }
}
