import path from "path";
import dotenv from "dotenv";

dotenv.config();

const toInt = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBool = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const parseOrigins = (value) => {
  if (!value) return ["*"];
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length ? origins : ["*"];
};

const baseDir = process.cwd();

export const config = {
  csvPath: process.env.MEGA_FACIL_CSV_PATH ??
    path.join(baseDir, "backend", "data", "mega_sena.csv"),
  windowSize: toInt(process.env.MEGA_FACIL_WINDOW_SIZE, 50),
  combinationsPerCard: toInt(process.env.MEGA_FACIL_COMBINATIONS_PER_CARD, 3),
  creditsPerCard: toInt(process.env.MEGA_FACIL_CREDITS_PER_CARD, 1),
  rateLimitMax: toInt(process.env.MEGA_FACIL_RATE_LIMIT_MAX, 20),
  rateLimitWindow: toInt(process.env.MEGA_FACIL_RATE_LIMIT_WINDOW, 60),
  allowedOrigins: parseOrigins(process.env.MEGA_FACIL_ALLOWED_ORIGINS),
  seed: process.env.MEGA_FACIL_SEED ?? null,
  trustProxyHeaders: toBool(process.env.MEGA_FACIL_TRUST_PROXY_HEADERS, false),
  requireApiKey: toBool(process.env.MEGA_FACIL_REQUIRE_API_KEY, true),
  adminUsername: process.env.MEGA_FACIL_ADMIN_USERNAME ?? null,
  adminPassword: process.env.MEGA_FACIL_ADMIN_PASSWORD ?? null,
  db: {
    host: process.env.MEGA_FACIL_DB_HOST ?? "localhost",
    port: toInt(process.env.MEGA_FACIL_DB_PORT, 3306),
    user: process.env.MEGA_FACIL_DB_USER ?? "root",
    password: process.env.MEGA_FACIL_DB_PASSWORD ?? "",
    name: process.env.MEGA_FACIL_DB_NAME ?? "mega_facil",
  },
};
