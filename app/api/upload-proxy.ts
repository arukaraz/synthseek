import { API_URL } from "@utils/env";
import { forwardedRequestHeaders } from "@utils/proxy-headers";
import { NextResponse, type NextRequest } from "next/server";

export async function streamUploadToApi(request: NextRequest, apiPath: string): Promise<Response> {
  const init: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers: forwardedRequestHeaders(request.headers),
    body: request.body,
    duplex: "half",
    cache: "no-store",
  };

  const response = await fetch(`${API_URL}${apiPath}`, init);
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  return new Response(response.body, { status: response.status, headers });
}

export function uploadUnreachable(): Response {
  return NextResponse.json({ error: "uploadFailed" }, { status: 502 });
}
