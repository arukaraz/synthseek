import type { LastfmTopTrack } from "@features/discovery-integrations/types";

export function createTopTrack(overrides: Partial<LastfmTopTrack> = {}): LastfmTopTrack {
  return {
    catalogTrackId: "deezer:1",
    title: "Windowlicker",
    artist: "Aphex Twin",
    albumExternalId: "deezer:album:1",
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
    playcount: 4200,
    ...overrides,
  };
}
