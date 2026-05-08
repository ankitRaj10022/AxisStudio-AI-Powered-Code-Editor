import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { getOllamaStatus } from "@/lib/ollama";

export async function GET() {
  const ollama = await getOllamaStatus();

  return NextResponse.json(
    {
      status: ollama.reachable && ollama.modelAvailable ? "ok" : "degraded",
      service: "axisStudio",
      databaseConfigured: isDatabaseConfigured(),
      ollama,
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
