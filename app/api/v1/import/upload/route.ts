import { API_URL } from "@utils/env";
import { forwardedRequestHeaders } from "@utils/proxy-headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  const init: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers: forwardedRequestHeaders(request.headers),
    body: request.body,
    duplex: "half",
    cache: "no-store",
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/import/upload`, init);
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json({ error: "uploadFailed" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
