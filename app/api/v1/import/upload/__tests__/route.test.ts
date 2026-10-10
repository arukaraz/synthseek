import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

const fetchMock = vi.fn<(url: string, init: RequestInit & { duplex?: string }) => Promise<Response>>();

function uploadRequest(body: string): NextRequest {
  return new NextRequest("https://synthseek.example/api/v1/import/upload", {
    method: "POST",
    body,
    headers: {
      cookie: "synthseek_session=abc",
      "content-type": "multipart/form-data; boundary=x",
      host: "synthseek.example",
      connection: "keep-alive",
      expect: "100-continue",
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

describe("the upload proxy", () => {
  it("streams the body to the server as it arrives, with the caller's session and none of its hop headers", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ batchId: "b1", totalFiles: 1, rejected: [] }), {
        status: 201,
        headers: { "content-type": "application/json", "set-cookie": "x=y" },
      })
    );

    const response = await POST(uploadRequest("--x\r\nbody\r\n--x--"));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:4401/api/v1/import/upload");
    expect(init.duplex).toBe("half");
    expect(init.body).toBeInstanceOf(ReadableStream);
    expect(await new Response(init.body).text()).toBe("--x\r\nbody\r\n--x--");
    const headers = new Headers(init.headers);
    expect(headers.get("cookie")).toBe("synthseek_session=abc");
    expect(headers.get("content-type")).toBe("multipart/form-data; boundary=x");
    expect(headers.has("host")).toBe(false);
    expect(headers.has("connection")).toBe(false);
    expect(headers.has("expect")).toBe(false);

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(await response.json()).toEqual({ batchId: "b1", totalFiles: 1, rejected: [] });
  });

  it("passes the server's refusal through untouched", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "batchTooLarge" }), {
        status: 413,
        headers: { "content-type": "application/json" },
      })
    );

    const response = await POST(uploadRequest("x"));

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "batchTooLarge" });
  });

  it("answers with the upload failure the page already knows when the server cannot be reached", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    const response = await POST(uploadRequest("x"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "uploadFailed" });
  });
});
