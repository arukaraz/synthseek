import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WORKSHOP_KEY_COMMIT_MS } from "../../components/PlaylistWorkshop/constants";
import type { WorkshopTrack } from "../../components/PlaylistWorkshop/types";
import { usePlaylistOrder } from "../usePlaylistOrder";

function track(requestId: string): WorkshopTrack {
  return {
    externalId: `ext-${requestId}`,
    title: requestId,
    artist: "Artist",
    artistExternalId: null,
    durationMs: 1000,
    trackNumber: 1,
    plays: null,
    hasPreview: false,
    album: null,
    inLibrary: true,
    requestId,
    slskd_request_id: null,
    status: "complete",
    failureReason: null,
  };
}

const STORED = [track("a"), track("b"), track("c")];
const shown = (ordered: readonly WorkshopTrack[]) => ordered.map((entry) => entry.requestId);

describe("usePlaylistOrder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a dragged order at once and saves it only when the drag ends", () => {
    const save = vi.fn();
    const { result } = renderHook(() => usePlaylistOrder(STORED, save));

    act(() => result.current.arrange(["b", "a", "c"]));

    expect(shown(result.current.ordered)).toEqual(["b", "a", "c"]);
    expect(save).not.toHaveBeenCalled();

    act(() => void result.current.commit());

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0]?.[0]).toEqual(["b", "a", "c"]);
  });

  it("saves a waiting keyboard move at once when asked, and tells the caller when that save has settled", async () => {
    const save = vi.fn();
    const { result } = renderHook(() => usePlaylistOrder(STORED, save));
    const settledBeforeRemoval = vi.fn();

    act(() => result.current.placeSoon(["b", "a", "c"]));
    expect(save).not.toHaveBeenCalled();

    let flushed: Promise<void> = Promise.resolve();
    act(() => {
      flushed = result.current.commit().then(settledBeforeRemoval);
    });
    expect(save).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(settledBeforeRemoval).not.toHaveBeenCalled();

    const settled: () => void = save.mock.calls[0]?.[1];
    act(() => settled());
    await flushed;

    expect(settledBeforeRemoval).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(WORKSHOP_KEY_COMMIT_MS));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("waits for a save already on its way instead of sending the same order twice", async () => {
    const save = vi.fn();
    const { result } = renderHook(() => usePlaylistOrder(STORED, save));

    act(() => result.current.place(["c", "a", "b"]));
    let waited = false;
    let flushed: Promise<void> = Promise.resolve();
    act(() => {
      flushed = result.current.commit().then(() => {
        waited = true;
      });
    });
    await Promise.resolve();

    expect(save).toHaveBeenCalledTimes(1);
    expect(waited).toBe(false);

    const settled: () => void = save.mock.calls[0]?.[1];
    act(() => settled());
    await flushed;

    expect(waited).toBe(true);
  });

  it("saves nothing when the track is dropped back where it was", () => {
    const save = vi.fn();
    const { result } = renderHook(() => usePlaylistOrder(STORED, save));

    act(() => result.current.arrange(["b", "a", "c"]));
    act(() => result.current.arrange(["a", "b", "c"]));
    act(() => void result.current.commit());

    expect(save).not.toHaveBeenCalled();
    expect(shown(result.current.ordered)).toEqual(["a", "b", "c"]);
  });

  it("goes back to the stored order once the save settles", () => {
    const save = vi.fn();
    const { result } = renderHook(() => usePlaylistOrder(STORED, save));

    act(() => result.current.place(["c", "a", "b"]));
    expect(shown(result.current.ordered)).toEqual(["c", "a", "b"]);

    const settled: () => void = save.mock.calls[0]?.[1];
    act(() => settled());

    expect(shown(result.current.ordered)).toEqual(["a", "b", "c"]);
  });

  it("keeps a newer arrangement when an older save settles late", () => {
    const save = vi.fn();
    const { result } = renderHook(() => usePlaylistOrder(STORED, save));

    act(() => result.current.place(["c", "a", "b"]));
    const firstSettled: () => void = save.mock.calls[0]?.[1];
    act(() => result.current.arrange(["b", "c", "a"]));
    act(() => firstSettled());

    expect(shown(result.current.ordered)).toEqual(["b", "c", "a"]);
  });

  it("gathers a run of keyboard moves into one save after a pause", () => {
    const save = vi.fn();
    const { result } = renderHook(() => usePlaylistOrder(STORED, save));

    act(() => result.current.placeSoon(["b", "a", "c"]));
    act(() => vi.advanceTimersByTime(WORKSHOP_KEY_COMMIT_MS - 1));
    act(() => result.current.placeSoon(["b", "c", "a"]));
    act(() => vi.advanceTimersByTime(WORKSHOP_KEY_COMMIT_MS - 1));

    expect(save).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0]?.[0]).toEqual(["b", "c", "a"]);
  });

  it("saves a pending keyboard move when the workshop closes before the pause ends", () => {
    const save = vi.fn();
    const { result, unmount } = renderHook(() => usePlaylistOrder(STORED, save));

    act(() => result.current.placeSoon(["b", "a", "c"]));
    unmount();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0]?.[0]).toEqual(["b", "a", "c"]);
  });
});
