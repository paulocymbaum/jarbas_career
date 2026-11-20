import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { adminApiPlugin } from "./scripts/dev/admin-api-plugin";

const __dirnameResolved = path.dirname(fileURLToPath(import.meta.url));

/**
 * Dev/preview servers serve /freelance from freelance.html the same way the
 * Vercel rewrite does in production (see vercel.json).
 */
function freelancePathRewritePlugin(): Plugin {
  const rewrite = (req: { url?: string }) => {
    const pathname = (req.url ?? "").split("?")[0];
    if (pathname === "/freelance" || pathname === "/freelance/") {
      req.url = "/freelance.html";
    }
  };
  return {
    name: "freelance-path-rewrite",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
  };
}

function umamiAnalyticsPlugin(): Plugin {
  return {
    name: "umami-analytics",
    transformIndexHtml(html, ctx) {
      if (ctx.server) return html;

      const websiteId = process.env.VITE_UMAMI_WEBSITE_ID?.trim();
      const scriptUrl = process.env.VITE_UMAMI_URL?.trim().replace(/\/$/, "");

      if (!websiteId || !scriptUrl) return html;

      const snippet =
        `    <script defer src="${scriptUrl}/script.js" data-website-id="${websiteId}"></script>\n`;
      return html.replace("</head>", `${snippet}  </head>`);
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react(), umamiAnalyticsPlugin(), adminApiPlugin(), freelancePathRewritePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirnameResolved, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirnameResolved, "index.html"),
        freelance: path.resolve(__dirnameResolved, "freelance.html"),
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/react-dom|scheduler|\/react\//.test(id)) return "vendor-react";
          if (/animejs|\/anime\//.test(id)) return "vendor-anime";
          return "vendor";
        },
      },
    },
  },
});
