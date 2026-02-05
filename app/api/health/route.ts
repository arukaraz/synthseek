import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.INTERNAL_API_URL || `http://localhost:${process.env.API_PORT || "4401"}`;

export async function GET(request: NextRequest): Promise<Response> {
  const full = request.nextUrl.searchParams.get("full");
  const url = `${BACKEND_URL}/api/health${full ? "?full=true" : ""}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ status: "degraded", frontend: "ok" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
