import { API_URL } from "@utils/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const url = `${API_URL}/api/v1/types${request.nextUrl.search}`;

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
