import crypto from "node:crypto";
import http from "node:http";
import path from "node:path";
import { URL } from "node:url";
import { config as loadEnv } from "dotenv";
import {
  buildAuthorizationUrl,
  LinkedInClient,
  loadLinkedInConfig,
} from "./integrations/linkedin/index.js";
import { getProjectRoot } from "./lib/db.js";

loadEnv({ path: path.join(getProjectRoot(), ".env") });

function printTokenInstructions(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}): void {
  console.info("\nAdd or update these values in your .env file:\n");
  console.info(`LINKEDIN_ACCESS_TOKEN=${tokens.access_token}`);
  if (tokens.refresh_token) {
    console.info(`LINKEDIN_REFRESH_TOKEN=${tokens.refresh_token}`);
  }
  console.info(`# expires_in: ${tokens.expires_in}s`);
  if (tokens.scope) {
    console.info(`# granted scopes: ${tokens.scope}`);
  }
  console.info("\nThen run: npm run sync:linkedin\n");
}

async function main(): Promise<void> {
  const config = loadLinkedInConfig();
  const state = crypto.randomBytes(16).toString("hex");
  const redirect = new URL(config.redirectUri);
  const listenPort = Number(redirect.port || config.authListenPort);
  const listenHost = redirect.hostname === "localhost" ? "127.0.0.1" : redirect.hostname;

  const authUrl = buildAuthorizationUrl(config, state);

  console.info("LinkedIn OAuth — one-time authorization\n");
  console.info("1. Open this URL in your browser:\n");
  console.info(`   ${authUrl}\n`);
  console.info(`2. Approve the app. You will be redirected to ${config.redirectUri}\n`);

  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (!req.url) {
          res.writeHead(400);
          res.end("Bad request");
          return;
        }

        const callbackUrl = new URL(req.url, `http://${listenHost}:${listenPort}`);
        if (callbackUrl.pathname !== redirect.pathname) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const error = callbackUrl.searchParams.get("error");
        if (error) {
          res.writeHead(400);
          res.end(`Authorization failed: ${error}`);
          reject(new Error(`OAuth error: ${error}`));
          server.close();
          return;
        }

        const code = callbackUrl.searchParams.get("code");
        const returnedState = callbackUrl.searchParams.get("state");

        if (!code || returnedState !== state) {
          res.writeHead(400);
          res.end("Invalid OAuth callback");
          reject(new Error("Invalid OAuth callback (missing code or state mismatch)"));
          server.close();
          return;
        }

        const client = new LinkedInClient({ ...config, accessToken: undefined });
        const tokens = await client.exchangeAuthorizationCode(code);

        const authedClient = new LinkedInClient({ ...config, accessToken: tokens.access_token });
        const userInfo = await authedClient.fetchUserInfo();
        const memberUrn = userInfo.sub.startsWith("urn:li:person:")
          ? userInfo.sub
          : `urn:li:person:${userInfo.sub}`;

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>LinkedIn authorization complete</h1><p>You can close this tab.</p>");

        console.info(`LINKEDIN_MEMBER_URN=${memberUrn}`);
        printTokenInstructions(tokens);

        server.close();
        resolve();
      } catch (callbackError) {
        reject(callbackError);
        server.close();
      }
    });

    server.listen(listenPort, listenHost, () => {
      console.info(`Waiting for callback on http://${listenHost}:${listenPort}${redirect.pathname} …`);
    });

    server.on("error", reject);
  });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
