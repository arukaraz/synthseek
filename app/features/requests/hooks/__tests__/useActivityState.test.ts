import i18n from "@locale";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { useActivityState } from "../useActivityState";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
  },
}));

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

  it("derives synced and total from live progress over the stored sync state", () => {
    mocks.syncState = { running: true, synced: 1, total: 10 };
    mocks.progress = { phase: "running", synced: 5, total: 8, failed: 0 };
    const { result } = renderHook(() => useActivityState());
    expect(result.current).toMatchObject({ synced: 5, total: 8 });
  });
});

describe("useActivityState completion toasts", () => {
  beforeEach(() => {
    mocks.items = undefined;
    mocks.syncState = undefined;
    mocks.queueState = undefined;
    mocks.progress = null;
    mocks.downloading = false;
    vi.clearAllMocks();
  });

  it("toasts success once when a sync completes with at least one synced playlist", () => {
    mocks.progress = { phase: "complete", synced: 3, total: 3, failed: 1 };
    renderHook(() => useActivityState());

    expect(toast.success).toHaveBeenCalledWith(
      i18n.t("mutations:requests.playlistsSyncedPlex", { count: 3, failed: 1 })
    );
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("toasts info when a sync completes with nothing synced", () => {
    mocks.progress = { phase: "complete", synced: 0, total: 0, failed: 0 };
    renderHook(() => useActivityState());

    expect(toast.info).toHaveBeenCalledWith(i18n.t("mutations:requests.noPlaylistsToSyncPlex"));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("does not re-fire the completion toast on a re-render without a phase change", () => {
    mocks.progress = { phase: "complete", synced: 2, total: 2, failed: 0 };
    const { rerender } = renderHook(() => useActivityState());
    rerender();

    expect(toast.success).toHaveBeenCalledOnce();
  });

  it("re-arms the completion toast after a fresh start phase", () => {
    mocks.progress = { phase: "complete", synced: 2, total: 2, failed: 0 };
    const { rerender } = renderHook(() => useActivityState());
    expect(toast.success).toHaveBeenCalledOnce();

    mocks.progress = { phase: "start", synced: 0, total: 0, failed: 0 };
    rerender();

    mocks.progress = { phase: "complete", synced: 4, total: 4, failed: 0 };
    rerender();

    expect(toast.success).toHaveBeenCalledTimes(2);
  });
});
