import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DIAGNOSTICS } from "../constants";
import type { PlayerDiagnosticEvent } from "../types";

interface SendCallbacks {
  onSuccess: (result: { logged: number; dropped: number }) => void;
  onError: () => void;
}

interface Sent {
  input: { deviceId: string; events: PlayerDiagnosticEvent[] };
  callbacks: SendCallbacks | undefined;
}

const api = vi.hoisted(() => ({ sent: [] as Sent[] }));

vi.mock("@hooks/api", () => ({
  useReportPlayerDiagnostics: () => ({
    mutate: (input: Sent["input"], callbacks?: SendCallbacks) => {
      api.sent.push({ input, callbacks });
    },
  }),
}));

function accept(sent: Sent | undefined, dropped = 0): void {
  const events = sent?.input.events.length ?? 0;
  sent?.callbacks?.onSuccess({ logged: events - dropped, dropped });
}

vi.mock("../device", () => ({ currentDeviceId: () => "dev-1" }));

let recordUserSkip: typeof import("../diagnostics").recordUserSkip;
let usePlayerDiagnostics: typeof import("../usePlayerDiagnostics").usePlayerDiagnostics;

function skip(count: number): void {
  for (let index = 0; index < count; index += 1) recordUserSkip(null, index, "next");
}

beforeEach(async () => {
  vi.useFakeTimers();
  api.sent = [];
  vi.resetModules();
  ({ recordUserSkip } = await import("../diagnostics"));
  ({ usePlayerDiagnostics } = await import("../usePlayerDiagnostics"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("usePlayerDiagnostics", () => {
  it("sends what was recorded before it mounted, in one batch after the flush delay", () => {
    skip(2);
    renderHook(() => usePlayerDiagnostics());

    expect(api.sent).toHaveLength(0);
    vi.advanceTimersByTime(DIAGNOSTICS.FLUSH_DELAY_MS);

    expect(api.sent).toHaveLength(1);
    expect(api.sent[0]?.input.deviceId).toBe("dev-1");
    expect(api.sent[0]?.input.events.map((event) => event.positionSeconds)).toEqual([0, 1]);
  });

  it("states how long ago each event happened", () => {
    renderHook(() => usePlayerDiagnostics());
    skip(1);

    vi.advanceTimersByTime(DIAGNOSTICS.FLUSH_DELAY_MS);

    expect(api.sent[0]?.input.events[0]?.ageMs).toBe(DIAGNOSTICS.FLUSH_DELAY_MS);
  });

  it("sends at once when a full batch is waiting, and never more than a batch per call", () => {
    renderHook(() => usePlayerDiagnostics());

    skip(DIAGNOSTICS.MAX_BATCH + 5);

    expect(api.sent).toHaveLength(1);
    expect(api.sent[0]?.input.events).toHaveLength(DIAGNOSTICS.MAX_BATCH);
    accept(api.sent[0]);
    vi.advanceTimersByTime(DIAGNOSTICS.FLUSH_DELAY_MS);
    expect(api.sent[1]?.input.events).toHaveLength(5);
  });

  it("retries a failed batch, then drops it after the last attempt", () => {
    renderHook(() => usePlayerDiagnostics());
    skip(1);

    for (let attempt = 1; attempt <= DIAGNOSTICS.MAX_SEND_ATTEMPTS; attempt += 1) {
      vi.advanceTimersByTime(DIAGNOSTICS.FLUSH_DELAY_MS);
      expect(api.sent).toHaveLength(attempt);
      api.sent[attempt - 1]?.callbacks?.onError();
    }
    vi.advanceTimersByTime(DIAGNOSTICS.FLUSH_DELAY_MS * 2);

    expect(api.sent).toHaveLength(DIAGNOSTICS.MAX_SEND_ATTEMPTS);
  });

  it("sends what is waiting when the page is hidden", () => {
    renderHook(() => usePlayerDiagnostics());
    skip(1);

    window.dispatchEvent(new Event("pagehide"));

    expect(api.sent).toHaveLength(1);
  });

  it("sends what queued during a send when the page is hidden, without waiting for that send", () => {
    renderHook(() => usePlayerDiagnostics());
    skip(DIAGNOSTICS.MAX_BATCH);
    expect(api.sent).toHaveLength(1);
    skip(DIAGNOSTICS.MAX_BATCH + 3);

    window.dispatchEvent(new Event("pagehide"));

    expect(api.sent.map((sent) => sent.input.events.length)).toEqual([DIAGNOSTICS.MAX_BATCH, DIAGNOSTICS.MAX_BATCH, 3]);
  });

  it("keeps what the server refused past its cap and sends it once the window has passed", () => {
    renderHook(() => usePlayerDiagnostics());
    skip(DIAGNOSTICS.MAX_BATCH);
    accept(api.sent[0], 5);

    skip(1);
    vi.advanceTimersByTime(DIAGNOSTICS.CAP_WINDOW_MS - 1);
    expect(api.sent).toHaveLength(1);
    window.dispatchEvent(new Event("pagehide"));
    expect(api.sent).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(api.sent).toHaveLength(2);
    expect(api.sent[1]?.input.events.map((event) => event.positionSeconds)).toEqual([35, 36, 37, 38, 39, 0]);
  });

  it("hands what is still queued back to the buffer when it unmounts during a send", () => {
    const { unmount } = renderHook(() => usePlayerDiagnostics());
    skip(DIAGNOSTICS.MAX_BATCH + 2);
    expect(api.sent).toHaveLength(1);

    unmount();
    renderHook(() => usePlayerDiagnostics());
    vi.advanceTimersByTime(DIAGNOSTICS.FLUSH_DELAY_MS);

    expect(api.sent).toHaveLength(2);
    expect(api.sent[1]?.input.events).toHaveLength(2);
  });

  it("stops listening when it unmounts, and keeps later events for the next mount", () => {
    const { unmount } = renderHook(() => usePlayerDiagnostics());
    unmount();
    skip(1);
    vi.advanceTimersByTime(DIAGNOSTICS.FLUSH_DELAY_MS);
    expect(api.sent).toHaveLength(0);

    renderHook(() => usePlayerDiagnostics());
    vi.advanceTimersByTime(DIAGNOSTICS.FLUSH_DELAY_MS);
    expect(api.sent).toHaveLength(1);
  });
});
