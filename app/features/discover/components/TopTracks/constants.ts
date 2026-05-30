export const HERO_LIMIT = 1;

export const LIST_LIMIT = 5;

export const SKELETON_LIST_PLACEHOLDERS = [0, 1, 2, 3, 4] as const;

export const SETTINGS_HREF = "/settings/integrations/metadata#lastfm";

export const EMPTY_COPY = {
  error: { text: "Couldn't load Last.fm data.", cta: null },
  disabled: { text: "Enable Last.fm to see your most played tracks here.", cta: "Open settings" },
  "no-username": { text: "Add your Last.fm username to start syncing top tracks.", cta: "Configure Last.fm" },
  "no-data": { text: "No top tracks yet, scrobble some music to see them ranked.", cta: null },
} as const;
