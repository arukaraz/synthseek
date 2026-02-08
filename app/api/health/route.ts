import { API_URL } from "@utils/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const full = request.nextUrl.searchParams.get("full");
  const url = `${API_URL}/api/health${full ? "?full=true" : ""}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ status: "degraded", frontend: "ok" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
