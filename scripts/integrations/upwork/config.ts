import { z } from "zod";

const boolFromEnv = z
  .enum(["true", "false", "1", "0", ""])
  .optional()
  .transform((value) => value === "true" || value === "1");

const upworkConfigSchema = z.object({
  clientId: z.string().min(1, "UPWORK_CLIENT_ID is required"),
  clientSecret: z.string().min(1, "UPWORK_CLIENT_SECRET is required"),
  redirectUri: z.string().url("UPWORK_REDIRECT_URI must be a valid URL"),
  scopes: z
    .string()
    .default("openid profile email profiles:read")
    .transform((value) => value.split(/\s+/).filter(Boolean)),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().optional(),
  apiUrl: z.string().url().default("https://api.upwork.com/graphql"),
  oauthAuthorizeUrl: z
    .string()
    .url()
    .default("https://www.upwork.com/ab/account-security/oauth2/authorize"),
  oauthTokenUrl: z.string().url().default("https://www.upwork.com/api/v3/oauth2/token"),
  authListenPort: z.coerce.number().int().positive().default(8788),
  stateDir: z.string().default("data/upwork"),
  syncExperience: boolFromEnv.default(true),
  syncProjects: boolFromEnv.default(true),
  defaultCity: z.string().default("Your City"),
  defaultCountry: z.string().default("Brazil"),
  projectSubjectPrefix: z.string().default("Portfolio project"),
  includePrivateRepos: boolFromEnv.default(false),
  featuredProjectsOnly: boolFromEnv.default(false),
});

export type UpworkConfig = z.infer<typeof upworkConfigSchema>;

export function loadUpworkConfig(env: NodeJS.ProcessEnv = process.env): UpworkConfig {
  return upworkConfigSchema.parse({
    clientId: env.UPWORK_CLIENT_ID,
    clientSecret: env.UPWORK_CLIENT_SECRET,
    redirectUri: env.UPWORK_REDIRECT_URI,
    scopes: env.UPWORK_SCOPES,
    accessToken: env.UPWORK_ACCESS_TOKEN || undefined,
    refreshToken: env.UPWORK_REFRESH_TOKEN || undefined,
    tokenExpiresAt: env.UPWORK_TOKEN_EXPIRES_AT || undefined,
    apiUrl: env.UPWORK_API_URL,
    oauthAuthorizeUrl: env.UPWORK_OAUTH_AUTHORIZE_URL,
    oauthTokenUrl: env.UPWORK_OAUTH_TOKEN_URL,
    authListenPort: env.UPWORK_AUTH_LISTEN_PORT,
    stateDir: env.UPWORK_STATE_DIR,
    syncExperience: env.UPWORK_SYNC_EXPERIENCE,
    syncProjects: env.UPWORK_SYNC_PROJECTS,
    defaultCity: env.UPWORK_DEFAULT_CITY,
    defaultCountry: env.UPWORK_DEFAULT_COUNTRY,
    projectSubjectPrefix: env.UPWORK_PROJECT_SUBJECT_PREFIX,
    includePrivateRepos: env.UPWORK_INCLUDE_PRIVATE_REPOS,
    featuredProjectsOnly: env.UPWORK_FEATURED_PROJECTS_ONLY,
  });
}

export function requireAccessToken(config: UpworkConfig): string {
  if (!config.accessToken) {
    throw new Error("UPWORK_ACCESS_TOKEN missing. Run: npm run upwork:auth (see EXTERNAL.md §Upwork)");
  }
  return config.accessToken;
}

export function buildAuthorizationUrl(config: UpworkConfig, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    state,
  });

  return `${config.oauthAuthorizeUrl}?${params.toString()}`;
}
