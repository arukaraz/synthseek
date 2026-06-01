import { API_URL } from "@utils/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const url = `${API_URL}/api/v1/logs/archive`;

  try {
    const cookie = request.headers.get("cookie");
    const response = await fetch(url, {
      headers: cookie ? { cookie } : {},
      cache: "no-store",
    });

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const disposition = response.headers.get("content-disposition");
    if (contentType) headers.set("content-type", contentType);
    if (disposition) headers.set("content-disposition", disposition);

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Logs archive proxy error:", error);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
