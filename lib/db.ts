import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/database/schema";

const POSTGRES_PROTOCOL = /^postgres(ql)?:\/\//i;

type AxisDatabase = ReturnType<typeof createDb>;

const globalForDatabase = globalThis as typeof globalThis & {
  axisStudioDb?: AxisDatabase | null;
};

function createDb(url: string) {
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export function getDatabaseUrl() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? null;

  if (!url || !POSTGRES_PROTOCOL.test(url)) {
    return null;
  }

  return url;
}

export function isDatabaseConfigured() {
  return getDatabaseUrl() !== null;
}

export function getDbOrNull() {
  const url = getDatabaseUrl();

  if (!url) {
    return null;
  }

  if (!globalForDatabase.axisStudioDb) {
    globalForDatabase.axisStudioDb = createDb(url);
  }

  return globalForDatabase.axisStudioDb;
}

export function getDb() {
  const db = getDbOrNull();

  if (!db) {
    throw new Error(
      "Postgres database is not configured. Set POSTGRES_URL or a PostgreSQL DATABASE_URL.",
    );
  }

  return db;
}
