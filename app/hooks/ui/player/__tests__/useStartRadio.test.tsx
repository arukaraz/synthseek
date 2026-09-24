import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

import { AUTOPLAY_STATION_SIZE } from "../constants";

const api = vi.hoisted(() => ({ fetchRadio: vi.fn() }));
vi.mock("@hooks/api", () => ({ useRadioTracksFetcher: () => api.fetchRadio }));

const store = vi.hoisted(() => ({ playStation: vi.fn() }));
vi.mock("../store", () => ({ actions: { playStation: store.playStation } }));

const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { useStartRadio } from "../useStartRadio";

const SEED: PlayerTrack = {
  id: "seed",
  title: "Seed",
  artist: "Band",
  album: "Record",
  durationSeconds: 200,
  format: "mp3",
  bitrateKbps: 320,
  lossless: false,
  tone: "primary",
  artworkUrl: null,
  albumId: "album-1",
  replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
};

function libraryItem(id: string) {
  return {
    id,
    title: `Title ${id}`,
    artist: "Band",
    albumName: "Record",
    album_id: "album-1",
    albumArt: null,
    duration_ms: 200_000,
    format: "mp3",
    file_format: null,
    bitrate: 320,
    file_bitrate: null,
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useStartRadio", () => {
  it("asks for a station from the target and plays it behind the seed", async () => {
    api.fetchRadio.mockResolvedValue({ items: [libraryItem("r1"), libraryItem("r2")] });
    const { result } = renderHook(() => useStartRadio());

    await result.current({ kind: "tracks", trackIds: ["seed"] }, SEED);

    expect(api.fetchRadio).toHaveBeenCalledWith({
      seed: { kind: "tracks", trackIds: ["seed"] },
      excludeTrackIds: [],
      count: AUTOPLAY_STATION_SIZE,
    });
    expect(store.playStation).toHaveBeenCalledTimes(1);
    expect(store.playStation.mock.calls[0]?.[0]).toBe(SEED);
    expect(store.playStation.mock.calls[0]?.[1].map((entry: PlayerTrack) => entry.id)).toEqual(["r1", "r2"]);
  });

  it("says so when the library has nothing like it, and plays nothing", async () => {
    api.fetchRadio.mockResolvedValue({ items: [] });
    const { result } = renderHook(() => useStartRadio());

    await result.current({ kind: "artist", artist: "Band" }, null);

    expect(toast.info).toHaveBeenCalledWith("queue.radioEmpty");
    expect(store.playStation).not.toHaveBeenCalled();
  });

  it("reports a failed request the same way a failed load is reported", async () => {
    api.fetchRadio.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useStartRadio());

    await result.current({ kind: "album", albumExternalId: "al-1" }, null);

    expect(toast.error).toHaveBeenCalledWith("queue.loadFailed");
    expect(store.playStation).not.toHaveBeenCalled();
  });
});
