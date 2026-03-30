import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

app.listen(PORT, () => {
  logger.info("Server started", {
    port: PORT,
    environment: process.env.NODE_ENV ?? "development",
    health: `http://localhost:${PORT}/health`,
  });
});
