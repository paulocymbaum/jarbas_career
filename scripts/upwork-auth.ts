import crypto from "node:crypto";
import http from "node:http";
import path from "node:path";
import { URL } from "node:url";
import { config as loadEnv } from "dotenv";
import {
  buildAuthorizationUrl,
  loadUpworkConfig,
  UpworkClient,
} from "./integrations/upwork/index.js";
import { getProjectRoot } from "./lib/db.js";

loadEnv({ path: path.join(getProjectRoot(), ".env") });

function printTokenInstructions(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}): void {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  console.info("\nAdd or update these values in your .env file:\n");
  console.info(`UPWORK_ACCESS_TOKEN=${tokens.access_token}`);
  if (tokens.refresh_token) {
    console.info(`UPWORK_REFRESH_TOKEN=${tokens.refresh_token}`);
  }
  console.info(`UPWORK_TOKEN_EXPIRES_AT=${expiresAt}`);
  console.info(`# expires_in: ${tokens.expires_in}s`);
  console.info("\nThen run: npm run sync:upwork -- --apply\n");
}

async function main(): Promise<void> {
  const config = loadUpworkConfig();
  const state = crypto.randomBytes(16).toString("hex");
  const redirect = new URL(config.redirectUri);
  const listenPort = Number(redirect.port || config.authListenPort);
  const listenHost = redirect.hostname === "localhost" ? "127.0.0.1" : redirect.hostname;
  const authUrl = buildAuthorizationUrl(config, state);

  console.info("Upwork OAuth — one-time authorization\n");
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

        const client = new UpworkClient(config);
        const tokens = await client.exchangeAuthorizationCode(code);

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Upwork authorization complete</h1><p>You can close this tab.</p>");

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
