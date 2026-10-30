import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { STAGE_WIDE_QUERY, TOUCH_SHORT_LANDSCAPE_QUERY } from "@components/Player/constants";

import { useDetailPlayback } from "../useDetailPlayback";

const { playback, stage, media } = vi.hoisted(() => ({
  playback: { playEntity: vi.fn(), shuffleEntity: vi.fn(), startRadio: vi.fn() },
  stage: { openStage: vi.fn() },
  media: { matches: new Set<string>() },
}));

vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => playback }));
vi.mock("@hooks/ui/player", () => ({ playerActions: stage }));
vi.mock("@hooks/ui/useMediaQuery", () => ({ useMediaQuery: (query: string) => media.matches.has(query) }));

const TARGET = { kind: "playlist", playlistId: "pl_1" } as const;

beforeEach(() => {
  vi.clearAllMocks();
  media.matches = new Set([STAGE_WIDE_QUERY]);
});

describe("useDetailPlayback", () => {
  it.each([
    ["play", "playEntity"],
    ["shuffle", "shuffleEntity"],
    ["radio", "startRadio"],
  ] as const)(
    "closes the modal once %s has started, and stays out of the stage on a wide screen",
    async (action, source) => {
      playback[source].mockResolvedValue(true);
      const onClose = vi.fn();
      const { result } = renderHook(() => useDetailPlayback(onClose));

      await act(() => result.current[action](TARGET));

      expect(playback[source]).toHaveBeenCalledWith(TARGET);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(stage.openStage).not.toHaveBeenCalled();
    }
  );

  it("opens the full screen player on a phone, after closing the modal", async () => {
    media.matches = new Set();
    const order: string[] = [];
    playback.playEntity.mockResolvedValue(true);
    stage.openStage.mockImplementation(() => order.push("stage"));
    const { result } = renderHook(() => useDetailPlayback(() => order.push("close")));

    await act(() => result.current.play(TARGET));

    expect(order).toEqual(["close", "stage"]);
  });

  it("opens the full screen player on a phone held sideways, which measures as wide", async () => {
    media.matches = new Set([STAGE_WIDE_QUERY, TOUCH_SHORT_LANDSCAPE_QUERY]);
    playback.playEntity.mockResolvedValue(true);
    const { result } = renderHook(() => useDetailPlayback(vi.fn()));

    await act(() => result.current.play(TARGET));

    expect(stage.openStage).toHaveBeenCalledTimes(1);
  });

  it("keeps the modal open when nothing started, so the reason can be read", async () => {
    media.matches = new Set();
    playback.startRadio.mockResolvedValue(false);
    const onClose = vi.fn();
    const { result } = renderHook(() => useDetailPlayback(onClose));

    await act(() => result.current.radio(TARGET));

    expect(onClose).not.toHaveBeenCalled();
    expect(stage.openStage).not.toHaveBeenCalled();
  });
});
