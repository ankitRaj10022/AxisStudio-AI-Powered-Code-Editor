import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "@/lib/database/schema";

const POSTGRES_PROTOCOL = /^postgres(ql)?:\/\//i;

type AxisDatabase = ReturnType<typeof createDb>;
type AxisPoolConfig = PoolConfig & {
  application_name?: string;
  enableChannelBinding?: boolean;
};

const globalForDatabase = globalThis as typeof globalThis & {
  axisStudioDb?: AxisDatabase | null;
};

function createPoolConfig(url: string): AxisPoolConfig {
  const connectionUrl = new URL(url);
  const sslMode = connectionUrl.searchParams.get("sslmode");
  const channelBindingMode = connectionUrl.searchParams.get("channel_binding");
  const database = connectionUrl.pathname.replace(/^\/+/, "");

  return {
    host: connectionUrl.hostname,
    port: connectionUrl.port ? Number(connectionUrl.port) : 5432,
    user: decodeURIComponent(connectionUrl.username),
    password: decodeURIComponent(connectionUrl.password),
    database: database ? decodeURIComponent(database) : undefined,
    ssl:
      sslMode === "disable"
        ? false
        : sslMode === "no-verify"
          ? { rejectUnauthorized: false }
          : { rejectUnauthorized: true },
    enableChannelBinding:
      channelBindingMode === "require" || channelBindingMode === "prefer",
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    max: 10,
    application_name: "axisstudio",
  };
}

function createDb(url: string) {
  const pool = new Pool(createPoolConfig(url));
  return drizzle({ client: pool, schema });
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
