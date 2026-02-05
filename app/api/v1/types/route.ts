import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.INTERNAL_API_URL || `http://localhost:${process.env.API_PORT || "4401"}`;

export async function GET(request: NextRequest): Promise<Response> {
  const url = `${BACKEND_URL}/api/v1/types${request.nextUrl.search}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "text/plain",
      },
    });
  } catch (error) {
    console.error("Types proxy error:", error);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
