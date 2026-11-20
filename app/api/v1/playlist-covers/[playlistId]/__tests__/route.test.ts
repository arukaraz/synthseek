import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_URL } from "@utils/env";

import { POST } from "../route";

const fetchMock = vi.fn<(url: string, init: RequestInit & { duplex?: string }) => Promise<Response>>();

function coverRequest(body: string): NextRequest {
  return new NextRequest("https://synthseek.example/api/v1/playlist-covers/pl%2F1", {
    method: "POST",
    body,
    headers: {
      cookie: "synthseek_session=abc",
      "content-type": "multipart/form-data; boundary=x",
      host: "synthseek.example",
    },
  });
}

function context(playlistId: string) {
  return { params: Promise.resolve({ playlistId }) };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("the playlist cover upload proxy", () => {
  it("streams the image to the playlist's own cover endpoint with the caller's session", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ cover: "/api/v1/playlist-covers/pl/v2" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const response = await POST(coverRequest("--x\r\nimage\r\n--x--"), context("pl/1"));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/api/v1/playlist-covers/pl%2F1`);
    expect(init.duplex).toBe("half");
    expect(init.body).toBeInstanceOf(ReadableStream);
    expect(await new Response(init.body).text()).toBe("--x\r\nimage\r\n--x--");
    const headers = new Headers(init.headers);
    expect(headers.get("cookie")).toBe("synthseek_session=abc");
    expect(headers.has("host")).toBe(false);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ cover: "/api/v1/playlist-covers/pl/v2" });
  });

  it("passes the server's refusal of an oversized image through untouched", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "PLAYLIST_COVER_TOO_LARGE" }), {
        status: 413,
        headers: { "content-type": "application/json" },
      })
    );

    const response = await POST(coverRequest("x"), context("pl-1"));

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "PLAYLIST_COVER_TOO_LARGE" });
  });

  it("answers with an upload failure when the server cannot be reached", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    const response = await POST(coverRequest("x"), context("pl-1"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "uploadFailed" });
  });
});
