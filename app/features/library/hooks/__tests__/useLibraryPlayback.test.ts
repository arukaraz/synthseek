import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

const spies = vi.hoisted(() => ({
  playQueue: vi.fn(),
  enqueueTracks: vi.fn<(tracks: readonly PlayerTrack[]) => boolean>(() => true),
}));

vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => ({ enqueueTracks: spies.enqueueTracks }),
}));

vi.mock("@hooks/ui/player", async (importActual) => {
  const actual = await importActual<typeof import("@hooks/ui/player")>();
  return { ...actual, playerActions: { ...actual.playerActions, playQueue: spies.playQueue } };
});

import { useLibraryPlayback } from "../useLibraryPlayback";

const EVERY_SOURCE: LibraryTrackItem["sources"] = [
  { key: "local", format: "mp3", bitrate: 320 },
  { key: "plex", format: null, bitrate: null },
  { key: "navidrome", format: "flac", bitrate: 900 },
  { key: "jellyfin", format: "flac", bitrate: 900 },
];

function item(id: string, sources: LibraryTrackItem["sources"] = EVERY_SOURCE): LibraryTrackItem {
  return {
    id,
    external_id: `ext-${id}`,
    title: `Song ${id}`,
    artist: "Air",
    status: "complete" as const,
    source: "deezer",
    format: "mp3" as const,
    request_type: "track" as const,
    bitrate: 320,
    file_bitrate: 320,
    file_format: "mp3",
    playable: true,
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    duration_ms: 200_000,
    track_number: 1,
    disc_number: 1,
    explicit: false,
    album_id: "al1",
    albumName: "Album",
    albumArt: null,
    genres: [],
    playlistIds: [],
    sources,
    created_at: new Date("2024-01-01T00:00:00Z"),
    completed_at: null,
  };
}

const ITEMS = [item("a"), item("b")];

function queuedSourceOrder(): string[][] {
  const queue: PlayerTrack[] = spies.playQueue.mock.calls[0]?.[0] ?? [];
  return queue.map((track) => track.sources.map((source) => source.key));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useLibraryPlayback", () => {
  it("plays every track from the one source the listener filtered to", () => {
    const { result } = renderHook(() => useLibraryPlayback(ITEMS, ["navidrome"]));

    result.current.play("b");

    expect(spies.playQueue).toHaveBeenCalledWith(expect.any(Array), 1);
    expect(queuedSourceOrder()).toEqual([["navidrome"], ["navidrome"]]);
  });

  it("orders several chosen sources by settings and leaves the unchosen ones out", () => {
    const { result } = renderHook(() => useLibraryPlayback(ITEMS, ["jellyfin", "navidrome"]));

    result.current.play("a");

    expect(queuedSourceOrder()).toEqual([
      ["navidrome", "jellyfin"],
      ["navidrome", "jellyfin"],
    ]);
  });

  it("skips a track no chosen source holds and starts from the clicked one", () => {
    const localOnly = item("c", [{ key: "local", format: "mp3", bitrate: 320 }]);
    const { result } = renderHook(() => useLibraryPlayback([localOnly, ...ITEMS], ["jellyfin"]));

    result.current.play("b");

    const queue: PlayerTrack[] = spies.playQueue.mock.calls[0]?.[0] ?? [];
    expect(queue.map((track) => track.id)).toEqual(["a", "b"]);
    expect(spies.playQueue).toHaveBeenCalledWith(expect.any(Array), 1);
  });

  it("queues the picked rows from the chosen sources only, in the settings order", async () => {
    const { result } = renderHook(() => useLibraryPlayback(ITEMS, ["jellyfin", "navidrome"]));

    await expect(result.current.enqueue(["b"])).resolves.toBe(true);

    const queued: readonly PlayerTrack[] = spies.enqueueTracks.mock.calls[0]?.[0] ?? [];
    expect(queued.map((track) => track.id)).toEqual(["b"]);
    expect(queued[0]?.sources.map((source) => source.key)).toEqual(["navidrome", "jellyfin"]);
  });

  it("queues nothing for a row no chosen source holds", async () => {
    const localOnly = item("c", [{ key: "local", format: "mp3", bitrate: 320 }]);
    const { result } = renderHook(() => useLibraryPlayback([localOnly], ["jellyfin"]));

    await result.current.enqueue(["c"]);

    expect(spies.enqueueTracks).toHaveBeenCalledWith([]);
  });

  it("keeps every source in settings order when none is chosen", () => {
    const { result } = renderHook(() => useLibraryPlayback(ITEMS, []));

    result.current.play("a");

    expect(queuedSourceOrder()).toEqual([
      ["local", "plex", "navidrome", "jellyfin"],
      ["local", "plex", "navidrome", "jellyfin"],
    ]);
  });
});
