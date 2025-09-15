import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool, dbPromise } from "./db";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "user_sessions",
    }),
    secret: process.env.SESSION_SECRET || "default",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Wait for database connection
    await dbPromise;
    console.log('Database initialized successfully');

    // Initialize session store table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    console.log('Session table initialized');

    await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Server error:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    if (!res.headersSent) {
      // Send JSON for API requests
      if (_req.path.startsWith("/api")) {
        res.status(status).json({ message });
      } else {
        // Send HTML for other requests in development
        const isDev = app.get("env") === "development";
        if (isDev) {
          res.status(status).send(`
            <html>
              <head>
                <title>Server Error</title>
                <style>
                  body { font-family: system-ui; padding: 2rem; line-height: 1.5; }
                  pre { background: #f0f0f0; padding: 1rem; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>Server Error</h1>
                <p>${message}</p>
                ${isDev && err.stack ? `<pre>${err.stack}</pre>` : ''}
              </body>
            </html>
          `);
        } else {
          // Simple error page in production
          res.status(status).send("Server Error");
        }
      }
    }
  });

    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    const PORT = parseInt(process.env.PORT || "5000", 10);
    const HOST = process.env.HOST || "localhost";

    httpServer.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
