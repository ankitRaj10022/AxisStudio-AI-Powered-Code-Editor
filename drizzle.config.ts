import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/axisstudio";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/database/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
