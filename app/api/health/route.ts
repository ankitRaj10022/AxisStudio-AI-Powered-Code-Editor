import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "axisStudio",
      databaseConfigured: isDatabaseConfigured(),
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
