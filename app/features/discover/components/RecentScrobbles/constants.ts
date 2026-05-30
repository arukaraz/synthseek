export const LASTFM_USER_URL_BASE = "https://www.last.fm/user";

export const SKELETON_PLACEHOLDERS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export const EMPTY_COPY = {
  error: { text: "Couldn't load Last.fm data.", cta: null },
  disabled: { text: "Enable Last.fm to see your recent scrobbles here.", cta: "Open settings" },
  "no-username": { text: "Add your Last.fm username to start syncing scrobbles.", cta: "Configure Last.fm" },
  "no-data": { text: "No scrobbles yet, your timeline will appear here.", cta: null },
} as const;

export const SETTINGS_HREF = "/settings/integrations/metadata#lastfm";
