import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useActivityState } from "../useActivityState";

const mocks = vi.hoisted(() => ({
  items: undefined as unknown,
  syncState: undefined as { running: boolean; synced: number; total: number } | undefined,
  queueState: undefined as { isPaused: boolean } | undefined,
  progress: null as unknown,
  downloading: false,
}));

vi.mock("@hooks/api", () => ({
  useTrackRequests: () => ({ data: mocks.items }),
  useGetPlexSyncAllState: () => ({ data: mocks.syncState }),
  useQueueStatus: () => ({ data: mocks.queueState }),
  usePlexSyncAllProgress: () => mocks.progress,
}));

vi.mock("../../helpers", () => ({
  hasActiveDownload: () => mocks.downloading,
}));

describe("useActivityState", () => {
  beforeEach(() => {
    mocks.items = undefined;
    mocks.syncState = undefined;
    mocks.queueState = undefined;
    mocks.progress = null;
    mocks.downloading = false;
  });

  it("returns paused when the queue is paused", () => {
    mocks.queueState = { isPaused: true };
    const { result } = renderHook(() => useActivityState());
    expect(result.current.state).toBe("paused");
  });

  it("prefers paused over an active download queue", () => {
    mocks.queueState = { isPaused: true };
    mocks.downloading = true;
    const { result } = renderHook(() => useActivityState());
    expect(result.current.state).toBe("paused");
  });

  it("keeps an in-flight plex sync as plex-sync even while paused", () => {
    mocks.queueState = { isPaused: true };
    mocks.syncState = { running: true, synced: 1, total: 4 };
    const { result } = renderHook(() => useActivityState());
    expect(result.current.state).toBe("plex-sync");
  });

  it("returns in-progress when downloading and not paused", () => {
    mocks.downloading = true;
    const { result } = renderHook(() => useActivityState());
    expect(result.current.state).toBe("in-progress");
  });

  it("returns idle when nothing is active", () => {
    mocks.queueState = { isPaused: false };
    const { result } = renderHook(() => useActivityState());
    expect(result.current.state).toBe("idle");
  });
});
