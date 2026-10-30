import i18n from "@locale";

import type { MusicTrack } from "@api/__generated__/types";

export function trendingTitle(track: MusicTrack): string {
  return track.title ?? i18n.t("discover:trendingHero.unknownTrack");
}

export function trendingArtist(track: MusicTrack): string {
  return track.artists?.[0]?.name ?? track.artist ?? i18n.t("discover:trendingHero.unknownArtist");
}
