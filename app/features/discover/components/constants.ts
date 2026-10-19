export const CARD_ROW_LIMITS = { half: 2, full: 4 } as const;

export const CARD_ROW_SKELETONS = [0, 1, 2, 3] as const;

export const LASTFM_SETTINGS_HREF = "/settings/listening#lastfm.feeds";

export const LASTFM_EMPTY_CTA = {
  error: null,
  disabled: "open-settings",
  "no-username": "configure",
  "no-data": null,
} as const;
