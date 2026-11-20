import type { Connect } from "vite";
import type { Plugin } from "vite";
import { handleAdminRequest } from "./admin-handlers.js";

function adminMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? "";
    if (!url.startsWith("/api/admin")) {
      next();
      return;
    }

    const pathname = url.split("?")[0] ?? url;
    void handleAdminRequest(req, res, pathname).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: message }));
    });
  };
}

export function adminApiPlugin(): Plugin {
  return {
    name: "admin-api",
    configureServer(server) {
      server.middlewares.use(adminMiddleware());
    },
  };
}
