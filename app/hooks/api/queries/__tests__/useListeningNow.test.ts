import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { soonestListeningEnd } from "../playback/helpers";
import { useListeningNow } from "../playback/useListeningNow";

interface ListeningNowAnswer {
  data: { remainingMs: number | null }[] | undefined;
  dataUpdatedAt: number;
}

const api = vi.hoisted(() => {
  const options: unknown[] = [];
  const result: ListeningNowAnswer = { data: undefined, dataUpdatedAt: 0 };
  return { options, invalidate: vi.fn(), result };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ playback: { listeningNow: { invalidate: api.invalidate } } }),
    playback: {
      listeningNow: {
        useQuery: (_input: unknown, options: unknown) => {
          api.options.push(options);
          return api.result;
        },
      },
    },
  },
}));

const NOW = new Date("2026-11-12T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  api.invalidate.mockReset();
  api.options.length = 0;
  api.result = { data: undefined, dataUpdatedAt: 0 };
});

afterEach(() => {
  vi.useRealTimers();
});

describe("soonestListeningEnd", () => {
  it("names the track that ends first among the ones playing", () => {
    expect(soonestListeningEnd([{ remainingMs: 90_000 }, { remainingMs: null }, { remainingMs: 30_000 }])).toBe(30_000);
  });

  it("names nothing while nobody is playing or before the first answer", () => {
    expect(soonestListeningEnd([{ remainingMs: null }])).toBeNull();
    expect(soonestListeningEnd(undefined)).toBeNull();
  });
});

describe("useListeningNow", () => {
  it("does not poll, since the server announces every change", () => {
    renderHook(() => useListeningNow());

    expect(api.options).toEqual([undefined]);
  });

  it("asks again once, right after the first live track should have ended", () => {
    api.result = { data: [{ remainingMs: 30_000 }, { remainingMs: 90_000 }], dataUpdatedAt: NOW.getTime() };
    renderHook(() => useListeningNow());

    vi.advanceTimersByTime(30_000);
    expect(api.invalidate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_000);
    expect(api.invalidate).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(120_000);
    expect(api.invalidate).toHaveBeenCalledTimes(1);
  });

  it("counts from when the answer arrived, not from when the component mounted", () => {
    api.result = { data: [{ remainingMs: 30_000 }], dataUpdatedAt: NOW.getTime() - 20_000 };
    renderHook(() => useListeningNow());

    vi.advanceTimersByTime(11_000);

    expect(api.invalidate).toHaveBeenCalledTimes(1);
  });

  it("sets no timer while nobody is playing", () => {
    api.result = { data: [{ remainingMs: null }], dataUpdatedAt: NOW.getTime() };
    renderHook(() => useListeningNow());

    vi.advanceTimersByTime(600_000);

    expect(api.invalidate).not.toHaveBeenCalled();
  });

  it("drops its timer when the component goes away", () => {
    api.result = { data: [{ remainingMs: 30_000 }], dataUpdatedAt: NOW.getTime() };
    const { unmount } = renderHook(() => useListeningNow());

    unmount();
    vi.advanceTimersByTime(60_000);

    expect(api.invalidate).not.toHaveBeenCalled();
  });
});
