import { API_URL } from "@utils/env";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolvePublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const proto = forwardedProto?.split(",")[0]?.trim() || "https";
    return `${proto}://${forwardedHost.split(",")[0]?.trim()}`;
  }
  const host = request.headers.get("host");
  if (host) {
    const proto = request.nextUrl.protocol.replace(":", "") || "https";
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

function redirectWith(request: NextRequest, params: Record<string, string>): NextResponse {
  const target = new URL("/requests", resolvePublicOrigin(request));
  for (const [key, value] of Object.entries(params)) {
    target.searchParams.set(key, value);
  }
  return NextResponse.redirect(target);
}

export async function GET(request: NextRequest): Promise<Response> {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return redirectWith(request, { spotify: "error", reason: error });
  }
  if (!code || !state) {
    return redirectWith(request, { spotify: "error", reason: "missing_params" });
  }

  const upstreamUrl = `${API_URL}/api/v1/trpc/librarySource.spotify.handleCallback`;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const correlationId = request.headers.get("x-correlation-id") ?? "";

  try {
    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
        ...(correlationId ? { "x-correlation-id": correlationId } : {}),
      },
      body: JSON.stringify({ json: { state, code } }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Spotify callback upstream failed", response.status, text.slice(0, 200));
      return redirectWith(request, { spotify: "error", reason: classifyUpstreamError(text) });
    }

    return redirectWith(request, { spotify: "connected" });
  } catch (err) {
    console.error("Spotify callback proxy error", err);
    return redirectWith(request, { spotify: "error", reason: "proxy_error" });
  }
}

function classifyUpstreamError(payload: string): string {
  if (/Active premium subscription required for the owner/i.test(payload)) {
    return "premium_propagation";
  }
  if (/not registered for this application/i.test(payload) || /user is not registered/i.test(payload)) {
    return "user_not_registered";
  }
  if (/Spotify is not configured/i.test(payload) || /not configured by the admin/i.test(payload)) {
    return "not_configured";
  }
  if (/state expired/i.test(payload) || /state\s+expired/i.test(payload)) {
    return "state_expired";
  }
  if (/UNAUTHORIZED/i.test(payload)) {
    return "session_expired";
  }
  return "exchange_failed";
}
