export const CARD_ROW_LIMITS = { half: 2, full: 4 } as const;

export const CARD_FIT = {
  MIN_WIDTH_PX: 140,
  GAP_PX: 12,
  MIN_COLUMNS: 2,
  CAPS: { S: 2, M: 4, L: 8 },
} as const;

export const CARD_ROW_SKELETONS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export const COMPACT_ROW_LIMIT = 4;

export const LASTFM_SETTINGS_HREF = "/settings/listening#lastfm.feeds";

export const LASTFM_EMPTY_CTA = {
  error: null,
  disabled: "open-settings",
  "no-username": "configure",
  "no-data": null,
} as const;
