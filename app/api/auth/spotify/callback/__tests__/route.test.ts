import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const CALLBACK = "https://synthseek.example/api/auth/spotify/callback";

function callbackRequest(query: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`${CALLBACK}${query}`, { headers });
}

function redirectTarget(response: Response): URL {
  const location = response.headers.get("location");
  if (location === null) throw new Error("the handler returned no redirect");
  return new URL(location);
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 200 }))
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("what the callback sends the listener back to", () => {
  it("sends a successful connection back to the requests page", async () => {
    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz")));

    expect(target.pathname).toBe("/requests");
    expect(target.searchParams.get("spotify")).toBe("connected");
  });

  it("carries the reason Spotify itself refused", async () => {
    const target = redirectTarget(await GET(callbackRequest("?error=access_denied")));

    expect(target.searchParams.get("spotify")).toBe("error");
    expect(target.searchParams.get("reason")).toBe("access_denied");
  });

  it("refuses a callback that carries no code", async () => {
    const target = redirectTarget(await GET(callbackRequest("?state=xyz")));

    expect(target.searchParams.get("reason")).toBe("missing_params");
  });

  it("refuses a callback that carries no state, which is what ties it to this browser", async () => {
    const target = redirectTarget(await GET(callbackRequest("?code=abc")));

    expect(target.searchParams.get("reason")).toBe("missing_params");
  });

  it("never calls the backend for a callback it already knows is broken", async () => {
    await GET(callbackRequest("?error=access_denied"));

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("where the redirect points when the app is behind a proxy", () => {
  it("uses the host the proxy says the listener typed", async () => {
    const target = redirectTarget(
      await GET(callbackRequest("?code=abc&state=xyz", { "x-forwarded-host": "music.example.com" }))
    );

    expect(target.origin).toBe("https://music.example.com");
  });

  it("honours the scheme the proxy reports", async () => {
    const target = redirectTarget(
      await GET(
        callbackRequest("?code=abc&state=xyz", {
          "x-forwarded-host": "music.example.com",
          "x-forwarded-proto": "http",
        })
      )
    );

    expect(target.origin).toBe("http://music.example.com");
  });

  it("takes the first hop when a chain of proxies each added one", async () => {
    const target = redirectTarget(
      await GET(
        callbackRequest("?code=abc&state=xyz", {
          "x-forwarded-host": "music.example.com, internal.lan",
          "x-forwarded-proto": "https, http",
        })
      )
    );

    expect(target.origin).toBe("https://music.example.com");
  });

  it("falls back to the plain host header when no proxy said anything", async () => {
    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz", { host: "lan.local:15999" })));

    expect(target.origin).toBe("https://lan.local:15999");
  });
});

describe("what the callback asks the backend", () => {
  it("hands the code and the state to the backend, and carries the session cookie", async () => {
    await GET(callbackRequest("?code=abc&state=xyz", { cookie: "synthseek_session=token" }));

    const call = vi.mocked(fetch).mock.calls[0];
    expect(String(call?.[0])).toContain("librarySource.spotify.handleCallback");
    expect(call?.[1]?.body).toBe(JSON.stringify({ json: { state: "xyz", code: "abc" } }));
    expect(call?.[1]?.headers).toMatchObject({ cookie: "synthseek_session=token" });
  });

  it("passes the correlation id on so the two sides of the exchange can be tied together", async () => {
    await GET(callbackRequest("?code=abc&state=xyz", { "x-correlation-id": "corr-1" }));

    expect(vi.mocked(fetch).mock.calls[0]?.[1]?.headers).toMatchObject({ "x-correlation-id": "corr-1" });
  });

  it("sends no correlation header when the request carried none", async () => {
    await GET(callbackRequest("?code=abc&state=xyz"));

    expect(vi.mocked(fetch).mock.calls[0]?.[1]?.headers).not.toHaveProperty("x-correlation-id");
  });
});

describe("naming why the exchange failed", () => {
  function upstreamRefusal(body: string, status = 400): void {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(body, { status }))
    );
  }

  it("names an account whose premium has not propagated yet", async () => {
    upstreamRefusal("Active premium subscription required for the owner");

    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz")));

    expect(target.searchParams.get("reason")).toBe("premium_propagation");
  });

  it("names a listener the Spotify app has not been given access to", async () => {
    upstreamRefusal("This user is not registered for this application");

    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz")));

    expect(target.searchParams.get("reason")).toBe("user_not_registered");
  });

  it("names an instance whose administrator has not set Spotify up", async () => {
    upstreamRefusal("Spotify is not configured");

    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz")));

    expect(target.searchParams.get("reason")).toBe("not_configured");
  });

  it("names a sign-in the listener left too long", async () => {
    upstreamRefusal("state expired");

    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz")));

    expect(target.searchParams.get("reason")).toBe("state_expired");
  });

  it("names a session that lapsed while the listener was away at Spotify", async () => {
    upstreamRefusal('{"error":{"data":{"code":"UNAUTHORIZED"}}}', 401);

    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz")));

    expect(target.searchParams.get("reason")).toBe("session_expired");
  });

  it("falls back to a plain exchange failure for anything it cannot name", async () => {
    upstreamRefusal("something the frontend has never seen", 500);

    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz")));

    expect(target.searchParams.get("reason")).toBe("exchange_failed");
  });

  it("names a backend it could not reach at all", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("ECONNREFUSED")))
    );

    const target = redirectTarget(await GET(callbackRequest("?code=abc&state=xyz")));

    expect(target.searchParams.get("reason")).toBe("proxy_error");
  });
});
