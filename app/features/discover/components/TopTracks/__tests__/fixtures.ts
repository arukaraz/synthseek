import type { ListenedTrack } from "@hooks/api/queries/analytics/types";

export function createTopTrack(overrides: Partial<ListenedTrack> = {}): ListenedTrack {
  return {
    id: "deezer:1",
    title: "Windowlicker",
    artist: "Aphex Twin",
    albumImage: "https://img/windowlicker.jpg",
    playedAt: null,
    playcount: 4200,
    ...overrides,
  };
}
