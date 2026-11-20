import { z } from "zod";

const boolFromEnv = z
  .enum(["true", "false", "1", "0", ""])
  .optional()
  .transform((value) => value === "true" || value === "1");

const linkedInConfigSchema = z.object({
  clientId: z.string().min(1, "LINKEDIN_CLIENT_ID is required"),
  clientSecret: z.string().min(1, "LINKEDIN_CLIENT_SECRET is required"),
  redirectUri: z.string().url("LINKEDIN_REDIRECT_URI must be a valid URL"),
  scopes: z
    .string()
    .default("openid profile email")
    .transform((value) => value.split(/\s+/).filter(Boolean)),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  memberUrn: z.string().optional(),
  vanityName: z.string().optional(),
  apiBaseUrl: z.string().url().default("https://api.linkedin.com"),
  oauthBaseUrl: z.string().url().default("https://www.linkedin.com/oauth/v2"),
  oidcDiscoveryUrl: z
    .string()
    .url()
    .default("https://www.linkedin.com/oauth/.well-known/openid-configuration"),
  apiVersion: z.string().regex(/^\d{6}$/, "LINKEDIN_API_VERSION must be YYYYMM"),
  authListenPort: z.coerce.number().int().positive().default(8787),
  snapshotDir: z.string().default("data/linkedin"),
  syncProfile: boolFromEnv.default("true"),
  syncArticles: boolFromEnv.default("true"),
  syncExperience: boolFromEnv.default("true"),
  syncEducation: boolFromEnv.default("true"),
  syncSkills: boolFromEnv.default("true"),
  syncCertifications: boolFromEnv.default("true"),
  articlesPageSize: z.coerce.number().int().min(1).max(100).default(50),
  dataExportPath: z.string().optional(),
});

export type LinkedInConfig = z.infer<typeof linkedInConfigSchema>;

export function loadLinkedInConfig(env: NodeJS.ProcessEnv = process.env): LinkedInConfig {
  return linkedInConfigSchema.parse({
    clientId: env.LINKEDIN_CLIENT_ID,
    clientSecret: env.LINKEDIN_CLIENT_SECRET,
    redirectUri: env.LINKEDIN_REDIRECT_URI,
    scopes: env.LINKEDIN_SCOPES,
    accessToken: env.LINKEDIN_ACCESS_TOKEN || undefined,
    refreshToken: env.LINKEDIN_REFRESH_TOKEN || undefined,
    memberUrn: env.LINKEDIN_MEMBER_URN || undefined,
    vanityName: env.LINKEDIN_VANITY_NAME || undefined,
    apiBaseUrl: env.LINKEDIN_API_BASE_URL,
    oauthBaseUrl: env.LINKEDIN_OAUTH_BASE_URL,
    oidcDiscoveryUrl: env.LINKEDIN_OIDC_DISCOVERY_URL,
    apiVersion: env.LINKEDIN_API_VERSION ?? "202509",
    authListenPort: env.LINKEDIN_AUTH_LISTEN_PORT,
    snapshotDir: env.LINKEDIN_SNAPSHOT_DIR,
    syncProfile: env.LINKEDIN_SYNC_PROFILE,
    syncArticles: env.LINKEDIN_SYNC_ARTICLES,
    syncExperience: env.LINKEDIN_SYNC_EXPERIENCE,
    syncEducation: env.LINKEDIN_SYNC_EDUCATION,
    syncSkills: env.LINKEDIN_SYNC_SKILLS,
    syncCertifications: env.LINKEDIN_SYNC_CERTIFICATIONS,
    articlesPageSize: env.LINKEDIN_ARTICLES_PAGE_SIZE,
    dataExportPath: env.LINKEDIN_DATA_EXPORT_PATH || undefined,
  });
}

export function requireAccessToken(config: LinkedInConfig): string {
  if (!config.accessToken) {
    throw new Error(
      "LINKEDIN_ACCESS_TOKEN ausente. Execute: npm run linkedin:auth (ver EXTERNAL.md)",
    );
  }
  return config.accessToken;
}

export function buildAuthorizationUrl(config: LinkedInConfig, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    state,
  });

  return `${config.oauthBaseUrl}/authorization?${params.toString()}`;
}
