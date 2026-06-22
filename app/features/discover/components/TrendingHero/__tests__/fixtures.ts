import type { MusicTrack } from "@api/__generated__/types";

export function createTrack(overrides: Partial<MusicTrack> = {}): MusicTrack {
  return {
    type: "track",
    id: "track-1",
    title: "Test Track",
    artist: "Test Artist",
    artists: [{ id: "artist-1", name: "Test Artist" }],
    album: { id: "album-1", name: "Test Album", images: [] },
    duration_ms: 200000,
    track_number: 1,
    disc_number: 1,
    isrc: null,
    explicit: false,
    popularity: null,
    preview_url: null,
    images: [{ url: "https://img/cover.jpg", width: 640, height: 640 }],
    ...overrides,
  };
}

export function createTrendingItem(track: Partial<MusicTrack> = {}) {
  return { track: createTrack(track), addedAt: "2026-06-22T00:00:00.000Z" };
}
