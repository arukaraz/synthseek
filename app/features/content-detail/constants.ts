import type { SocialLink } from "./components/DetailHero/types";
import type { TracklistTrack } from "./components/Tracklist/types";

export const MINI_HEADER_SCROLL_THRESHOLD = 150;

export const PLAYS_MILLION = 1_000_000;

export const PLAYS_HUNDRED_K = 100_000;

export const EMPTY_SOCIALS: SocialLink[] = [];

export const EMPTY_GENRES: string[] = [];

export const EMPTY_TRACKS: TracklistTrack[] = [];

export const ARTIST_TYPE_LABEL_KEYS = {
  human: "details.typeValue.soloArtist",
  "musical group": "details.typeValue.band",
} as const;
