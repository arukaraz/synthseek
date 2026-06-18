import { RequestFormat, RequestMatchingMode } from "@api/__generated__/types";

import type { SocialLink } from "./components/DetailHero/types";
import type { TracklistTrack } from "./components/Tracklist/types";

export const MINI_HEADER_SCROLL_THRESHOLD = 150;

export const EMPTY_SOCIALS: SocialLink[] = [];

export const EMPTY_GENRES: string[] = [];

export const EMPTY_TRACKS: TracklistTrack[] = [];

export const PLAYLIST_REQUEST_CONFIG = {
  bitrate: { value: 320, matching: RequestMatchingMode.enum.flexible },
  format: { value: RequestFormat.enum.mp3, matching: RequestMatchingMode.enum.flexible },
} as const;
