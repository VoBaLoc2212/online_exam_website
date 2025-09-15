import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Handle favicon.ico requests early
  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end(); // No content response for favicon
  });

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: viteLogger,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // Check if file exists
      if (!fs.existsSync(clientTemplate)) {
        throw new Error(`Could not find index.html at ${clientTemplate}`);
      }

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      const error = e as Error;
      vite.ssrFixStacktrace(error);
      console.error("Error serving index.html:", error.message);
      
      // Send a more user-friendly error in development
      res.status(500).send(`
        <html>
          <head>
            <title>Development Server Error</title>
            <style>
              body { font-family: system-ui; padding: 2rem; line-height: 1.5; }
              pre { background: #f0f0f0; padding: 1rem; border-radius: 4px; }
            </style>
          </head>
          <body>
            <h1>Development Server Error</h1>
            <p>An error occurred while loading the development server:</p>
            <pre>${error.message}</pre>
            <p>Check the terminal for more details.</p>
          </body>
        </html>
      `);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
