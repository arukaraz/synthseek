import type { ParseKeys } from "i18next";

import type { ListeningProvider } from "@hooks/api/queries/analytics/types";

export const CARD_ROW_LIMITS = { S: 2, M: 2, L: 3, XL: 4 } as const;

export const CARD_FIT = {
  MIN_WIDTH_PX: 140,
  GAP_PX: 12,
  MIN_COLUMNS: 2,
  CAPS: { S: 2, M: 4, L: 6, XL: 8 },
} as const;

export const CARD_ROW_SKELETONS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export const COMPACT_ROW_LIMIT = 4;

export const PROVIDER_SETTINGS_HREFS: Record<ListeningProvider, string> = {
  lastfm: "/settings/connections/services#lastfm.feeds",
  listenbrainz: "/settings/connections/services#listenbrainz.feeds",
};

export const LOVED_TITLE_KEYS: Record<ListeningProvider, ParseKeys<"discover">> = {
  lastfm: "loved.title",
  listenbrainz: "loved.listenbrainzTitle",
};

export const PROVIDER_PROFILE_URLS: Record<ListeningProvider, string> = {
  lastfm: "https://www.last.fm/user",
  listenbrainz: "https://listenbrainz.org/user",
};
