import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_URL } from "@utils/env";

import { POST } from "../route";

const fetchMock = vi.fn<(url: string, init: RequestInit & { duplex?: string }) => Promise<Response>>();

function fontRequest(body: string): NextRequest {
  return new NextRequest("https://synthseek.example/api/v1/theme/fonts", {
    method: "POST",
    body,
    headers: {
      cookie: "synthseek_session=abc",
      "content-type": "multipart/form-data; boundary=x",
      host: "synthseek.example",
    },
  });
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

describe("the theme font upload proxy", () => {
  it("streams the font to the server's font endpoint with the caller's session", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ fonts: [], usedBytes: 0, maxBytes: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const response = await POST(fontRequest("--x\r\nfont\r\n--x--"));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/api/v1/theme/fonts`);
    expect(init.duplex).toBe("half");
    expect(await new Response(init.body).text()).toBe("--x\r\nfont\r\n--x--");
    const headers = new Headers(init.headers);
    expect(headers.get("cookie")).toBe("synthseek_session=abc");
    expect(headers.has("host")).toBe(false);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ fonts: [], usedBytes: 0, maxBytes: 1 });
  });

  it("passes the server's refusal of a file that is not a font through untouched", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "THEME_FONT_UNSUPPORTED" }), {
        status: 415,
        headers: { "content-type": "application/json" },
      })
    );

    const response = await POST(fontRequest("x"));

    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ error: "THEME_FONT_UNSUPPORTED" });
  });

  it("answers with an upload failure when the server cannot be reached", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    const response = await POST(fontRequest("x"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "uploadFailed" });
  });
});
