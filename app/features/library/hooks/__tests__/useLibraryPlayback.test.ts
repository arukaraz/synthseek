import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

const spies = vi.hoisted(() => ({ playQueue: vi.fn() }));

vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => ({ enqueueEntity: vi.fn() }),
}));

vi.mock("@hooks/ui/player", async (importActual) => {
  const actual = await importActual<typeof import("@hooks/ui/player")>();
  return { ...actual, playerActions: { ...actual.playerActions, playQueue: spies.playQueue } };
});

import { useLibraryPlayback } from "../useLibraryPlayback";

function item(id: string): LibraryTrackItem {
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
    sources: [
      { key: "local", format: "mp3", bitrate: 320 },
      { key: "plex", format: null, bitrate: null },
      { key: "navidrome", format: "flac", bitrate: 900 },
    ],
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
    const { result } = renderHook(() => useLibraryPlayback(ITEMS, "navidrome"));

    result.current.play("b");

    expect(spies.playQueue).toHaveBeenCalledWith(expect.any(Array), 1);
    expect(queuedSourceOrder()).toEqual([
      ["navidrome", "local", "plex"],
      ["navidrome", "local", "plex"],
    ]);
  });

  it("keeps the order from settings when no single source is chosen", () => {
    const { result } = renderHook(() => useLibraryPlayback(ITEMS, null));

    result.current.play("a");

    expect(queuedSourceOrder()).toEqual([
      ["local", "plex", "navidrome"],
      ["local", "plex", "navidrome"],
    ]);
  });
});
