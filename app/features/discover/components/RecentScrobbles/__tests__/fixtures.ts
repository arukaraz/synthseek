import type { LastfmScrobble } from "@features/discovery-integrations/types";

export function createScrobble(overrides: Partial<LastfmScrobble> = {}): LastfmScrobble {
  return {
    catalogTrackId: "track-1",
    title: "Windowlicker",
    artist: "Aphex Twin",
    albumExternalId: "album-1",
    albumName: "Windowlicker",
    albumArtist: "Aphex Twin",
    albumImage: "https://img/windowlicker.jpg",
    isrc: null,
    durationMs: 360000,
    trackNumber: 1,
    discNumber: 1,
    explicit: false,
    popularity: null,
    rank: 1,
    playedAt: "2026-05-29T11:55:00.000Z",
    playcount: null,
    ...overrides,
  };
}
