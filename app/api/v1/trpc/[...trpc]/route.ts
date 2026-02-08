import { API_URL } from "@utils/env";
import { NextRequest, NextResponse } from "next/server";

function isSSERequest(request: NextRequest): boolean {
  return request.headers.get("accept")?.includes("text/event-stream") ?? false;
}

async function handleSSERequest(request: NextRequest, path: string): Promise<Response> {
  const url = `${API_URL}/api/v1/trpc/${path}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!["host", "connection", "keep-alive", "transfer-encoding"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const backendResponse = await fetch(url, {
    method: request.method,
    headers,
    cache: "no-store",
  });

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: backendResponse.headers,
    });
  }

  const { readable, writable } = new TransformStream();
  backendResponse.body.pipeTo(writable).catch(console.error);

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

async function handleHTTPRequest(request: NextRequest, path: string): Promise<Response> {
  const url = `${API_URL}/api/v1/trpc/${path}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!["host", "connection", "keep-alive", "transfer-encoding"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  let body: BodyInit | null = null;
  if (request.method === "POST") {
    body = await request.text();
  }

  const backendResponse = await fetch(url, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  backendResponse.headers.forEach((value, key) => {
    if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

async function handler(request: NextRequest, { params }: { params: Promise<{ trpc: string[] }> }): Promise<Response> {
  const { trpc } = await params;
  const path = trpc.join("/");

  try {
    if (isSSERequest(request)) {
      return await handleSSERequest(request, path);
    }
    return await handleHTTPRequest(request, path);
  } catch (error) {
    console.error("tRPC proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
