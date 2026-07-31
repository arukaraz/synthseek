import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDropImportUpload } from "../useDropImportUpload";

const spies = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, error: spies.toastError },
}));

vi.mock("@locale", () => ({
  default: { t: (key: string, vars?: Record<string, unknown>) => (vars ? `${key}:${JSON.stringify(vars)}` : key) },
}));

interface FakeResponse {
  kind: "load" | "network-error";
  status?: number;
  body?: string;
}

const fake: { response: FakeResponse; sentForms: FormData[] } = {
  response: { kind: "load", status: 201, body: "{}" },
  sentForms: [],
};

class FakeXMLHttpRequest {
  status = 0;
  responseText = "";
  withCredentials = false;
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  open(): void {}

  send(form: FormData): void {
    fake.sentForms.push(form);
    queueMicrotask(() => {
      if (fake.response.kind === "network-error") {
        this.onerror?.();
        return;
      }
      this.status = fake.response.status ?? 0;
      this.responseText = fake.response.body ?? "";
      this.upload.onprogress?.(new ProgressEvent("progress", { lengthComputable: true, loaded: 5, total: 10 }));
      this.onload?.();
    });
  }
}

describe("useDropImportUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fake.sentForms = [];
    fake.response = { kind: "load", status: 201, body: "{}" };
    vi.stubGlobal("XMLHttpRequest", FakeXMLHttpRequest);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed success payload and toasts upload complete", async () => {
    fake.response = {
      kind: "load",
      status: 201,
      body: JSON.stringify({
        batchId: "batch-1",
        totalFiles: 2,
        rejected: [{ name: "notes.txt", reason: "unsupportedType" }],
      }),
    };
    const { result } = renderHook(() => useDropImportUpload());

    const outcome = await act(() => result.current.upload([new File(["a"], "a.mp3"), new File(["b"], "b.mp3")]));

    expect(outcome).toEqual({
      ok: true,
      batchId: "batch-1",
      totalFiles: 2,
      rejected: [{ name: "notes.txt", reason: "unsupportedType" }],
    });
    expect(spies.toastSuccess).toHaveBeenCalledTimes(1);
    expect(fake.sentForms[0].getAll("files")).toHaveLength(2);
  });

  it("returns the typed error code and toasts the mapped message", async () => {
    fake.response = { kind: "load", status: 413, body: JSON.stringify({ error: "batchTooLarge" }) };
    const { result } = renderHook(() => useDropImportUpload());

    const outcome = await act(() => result.current.upload([new File(["a"], "a.mp3")]));

    expect(outcome).toEqual({ ok: false, code: "batchTooLarge", rejected: [] });
    expect(spies.toastError).toHaveBeenCalledTimes(1);
    expect(String(spies.toastError.mock.calls[0][0])).toContain("batchTooLarge");
  });

  it("carries the rejected entries of a noAcceptedFiles failure", async () => {
    fake.response = {
      kind: "load",
      status: 400,
      body: JSON.stringify({ error: "noAcceptedFiles", rejected: [{ name: "notes.txt", reason: "unsupportedType" }] }),
    };
    const { result } = renderHook(() => useDropImportUpload());

    const outcome = await act(() => result.current.upload([new File(["a"], "a.txt")]));

    expect(outcome.ok).toBe(false);
    expect(outcome.rejected).toEqual([{ name: "notes.txt", reason: "unsupportedType" }]);
  });

  it("normalizes an unknown server code to uploadFailed", async () => {
    fake.response = { kind: "load", status: 500, body: JSON.stringify({ error: "somethingNew" }) };
    const { result } = renderHook(() => useDropImportUpload());

    const outcome = await act(() => result.current.upload([new File(["a"], "a.mp3")]));

    expect(outcome).toEqual({ ok: false, code: "uploadFailed", rejected: [] });
  });

  it("maps a network error to uploadFailed", async () => {
    fake.response = { kind: "network-error" };
    const { result } = renderHook(() => useDropImportUpload());

    const outcome = await act(() => result.current.upload([new File(["a"], "a.mp3")]));

    expect(outcome).toEqual({ ok: false, code: "uploadFailed", rejected: [] });
    expect(spies.toastError).toHaveBeenCalledTimes(1);
  });
});
