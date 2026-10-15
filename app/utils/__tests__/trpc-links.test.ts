import { createTRPCClient } from "@trpc/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppRouter } from "@api/__generated__/types";

import { getTRPCClientConfig } from "../trpc";

function answered(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

function client() {
  return createTRPCClient<AppRouter>(getTRPCClientConfig("tab-1"));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the tRPC links", () => {
  it("sends a call marked to outlive the page as a keepalive request, which the browser lets finish as the tab closes", async () => {
    const fetchSpy = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () =>
      answered({ result: { data: { json: { forgotten: true } } } })
    );
    vi.stubGlobal("fetch", fetchSpy);

    await client().playback.forgetDevice.mutate({ deviceId: "d1" }, { context: { outliveThePage: true } });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(String(url)).toContain("/api/v1/trpc/playback.forgetDevice");
    expect(init).toMatchObject({ keepalive: true, method: "POST" });
  });

  it("sends an ordinary call without keepalive", async () => {
    const fetchSpy = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () =>
      answered([{ result: { data: { json: { forgotten: true } } } }])
    );
    vi.stubGlobal("fetch", fetchSpy);

    await client().playback.forgetDevice.mutate({ deviceId: "d1" });

    const [, init] = fetchSpy.mock.calls[0] ?? [];
    expect(init?.keepalive).toBeUndefined();
  });
});
