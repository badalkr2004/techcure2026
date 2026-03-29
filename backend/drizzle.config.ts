import { config as loadEnv } from "dotenv";
import type { Config } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const envLocal = path.resolve(here, ".env");
const envRoot = path.resolve(here, "..", ".env");
const envOverride = process.env.DOTENV_CONFIG_PATH;

if (envOverride) {
  loadEnv({ path: envOverride });
}
loadEnv({ path: envLocal });
loadEnv({ path: envRoot, override: false });

function readEnvValue(filePath: string, key: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    if (k !== key) continue;
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return undefined;
}

const databaseUrl =
  process.env.DATABASE_URL ||
  (envOverride ? readEnvValue(envOverride, "DATABASE_URL") : undefined) ||
  readEnvValue(envLocal, "DATABASE_URL") ||
  readEnvValue(envRoot, "DATABASE_URL") ||
  "";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
