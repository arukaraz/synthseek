import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import enMutations from "@locale/messages/en/mutations.json";

import { downloadText, triggerDownload } from "../download";

const toast = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("sonner", () => ({ toast }));

let anchors: HTMLAnchorElement[] = [];
let revoked: string[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  anchors = [];
  revoked = [];
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: () => "blob:synthseek/1",
      revokeObjectURL: (url: string) => revoked.push(url),
    })
  );

  const realCreate = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    const node = realCreate(tag);
    if (node instanceof HTMLAnchorElement) {
      node.click = vi.fn();
      anchors.push(node);
    }
    return node;
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("downloadText", () => {
  it("hands the browser a file named the way the caller asked", () => {
    downloadText("playlist.jspf", '{"playlist":{}}');

    expect(anchors[0]?.download).toBe("playlist.jspf");
    expect(anchors[0]?.href).toBe("blob:synthseek/1");
    expect(anchors[0]?.click).toHaveBeenCalled();
  });

  it("takes the link back out of the page once the browser has it", () => {
    downloadText("playlist.jspf", "{}");

    expect(document.body.contains(anchors[0] ?? null)).toBe(false);
  });

  it("releases the blob rather than leaking it for the life of the tab", () => {
    downloadText("playlist.jspf", "{}");

    vi.runAllTimers();

    expect(revoked).toEqual(["blob:synthseek/1"]);
  });
});

describe("triggerDownload", () => {
  it("saves the file under the name the server put in the headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("body", {
            status: 200,
            headers: { "content-disposition": 'attachment; filename="report-2026.csv"' },
          })
      )
    );

    await triggerDownload("/api/v1/export", "fallback.csv");

    expect(anchors[0]?.download).toBe("report-2026.csv");
  });

  it("reads a filename the server sent without quotes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("body", {
            status: 200,
            headers: { "content-disposition": "attachment; filename=report.csv" },
          })
      )
    );

    await triggerDownload("/api/v1/export", "fallback.csv");

    expect(anchors[0]?.download).toBe("report.csv");
  });

  it("falls back to the caller's name when the server named nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("body", { status: 200 }))
    );

    await triggerDownload("/api/v1/export", "fallback.csv");

    expect(anchors[0]?.download).toBe("fallback.csv");
  });

  it("sends the session cookie, since the export is behind the login", async () => {
    const fetchMock = vi.fn(async () => new Response("body", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await triggerDownload("/api/v1/export", "fallback.csv");

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/export", { credentials: "include" });
  });

  it("says the export needs an administrator when the server refuses it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 403 }))
    );

    await triggerDownload("/api/v1/export", "fallback.csv");

    expect(toast.error).toHaveBeenCalledWith(enMutations.requests.adminRequired);
    expect(anchors).toHaveLength(0);
  });

  it("reports any other refusal as a failed download", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 500 }))
    );

    await triggerDownload("/api/v1/export", "fallback.csv");

    expect(toast.error).toHaveBeenCalledWith(enMutations.requests.downloadFailed);
  });

  it("reports a request that never reached the server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("offline")))
    );

    await triggerDownload("/api/v1/export", "fallback.csv");

    expect(toast.error).toHaveBeenCalledWith(enMutations.requests.downloadFailed);
  });
});
