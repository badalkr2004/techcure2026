import morgan from "morgan";
import type { RequestHandler } from "express";

export const requestLogger: RequestHandler =
  process.env.NODE_ENV === "production"
    ? morgan("combined")
    : morgan("dev");

export const logger = {
  info: (message: string, data?: object) => {
    if (process.env.NODE_ENV === "production") {
      console.log(
        JSON.stringify({
          level: "info",
          message,
          ...(data ?? {}),
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.log(`[INFO] ${message}`, data ?? "");
    }
  },
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === "production") {
      console.error(
        JSON.stringify({
          level: "error",
          message,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.error(`[ERROR] ${message}`, error);
    }
  },
  warn: (message: string, data?: object) => {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        JSON.stringify({
          level: "warn",
          message,
          ...(data ?? {}),
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.warn(`[WARN] ${message}`, data ?? "");
    }
  },
};
