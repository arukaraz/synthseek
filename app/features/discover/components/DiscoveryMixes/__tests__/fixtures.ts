import type { EmptyMix, FeedCandidate, ReadyMix } from "../types";

export function createCandidate(overrides: Partial<FeedCandidate> = {}): FeedCandidate {
  return {
    catalogTrackId: "deezer:1",
    title: "Tití Me Preguntó",
    artist: "Bad Bunny",
    albumExternalId: "deezer:album:1",
    albumName: "Un Verano Sin Ti",
    albumArtist: "Bad Bunny",
    albumImage: "https://cover/1.jpg",
    isrc: "USX000",
    durationMs: 240000,
    trackNumber: 3,
    discNumber: 1,
    explicit: true,
    popularity: 88,
    rank: 1,
    ...overrides,
  };
}

export function createReadyMix(overrides: Partial<ReadyMix> = {}): ReadyMix {
  return {
    kind: "daily-jams",
    status: "ready",
    candidates: [createCandidate()],
    generatedAt: "2026-05-29T07:00:00.000Z",
    ...overrides,
  };
}

export function createEmptyMix(overrides: Partial<EmptyMix> = {}): EmptyMix {
  return {
    kind: "weekly-jams",
    status: "empty",
    candidates: [],
    emptyReason: "playlist-not-generated-yet",
    ...overrides,
  };
}
