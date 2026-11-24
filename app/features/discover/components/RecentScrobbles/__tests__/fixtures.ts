import type { ListenedTrack } from "@hooks/api/queries/analytics/types";

export function createScrobble(overrides: Partial<ListenedTrack> = {}): ListenedTrack {
  return {
    id: "track-1",
    title: "Windowlicker",
    artist: "Aphex Twin",
    albumImage: "https://img/windowlicker.jpg",
    playedAt: "2026-05-29T11:55:00.000Z",
    playcount: null,
    ...overrides,
  };
}
