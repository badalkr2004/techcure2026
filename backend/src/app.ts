import express from "express";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { corsOptions } from "./lib/cors";
import { requestLogger, logger } from "./lib/logger";
import { defaultLimiter, authLimiter } from "./lib/rateLimit";
import { generateOpenAPISpec } from "./lib/openapi";
import routes from "./routes";

const app = express();

app.use(helmet());
app.use(corsOptions);
app.use(requestLogger);
app.use("/api/auth", authLimiter);
app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", defaultLimiter);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    version: process.env.npm_package_version ?? "0.0.1",
  });
});

app.get("/api/docs/json", (req, res) => {
  res.json(generateOpenAPISpec());
});

app.get("/api/docs", (req, res) => {
  const spec = JSON.stringify(generateOpenAPISpec());
  res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bihar Sahayata API Docs</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" type="text/css"
            href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" >
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
          <script>
            SwaggerUIBundle({
              spec: ${spec},
              dom_id: "#swagger-ui",
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
              layout: "BaseLayout",
              deepLinking: true,
              tryItOutEnabled: true,
            })
          </script>
        </body>
      </html>
    `);
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error", err);

    if (err.message.includes("not allowed by CORS")) {
      res.status(403).json({ error: "CORS: origin not allowed" });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
);

export default app;
