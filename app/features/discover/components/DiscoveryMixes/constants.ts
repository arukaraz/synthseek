import { Compass, Repeat, Sparkles, Sun } from "lucide-react";

import type { LbPlaylistKind } from "@features/discovery-integrations/types";

import type { LbKindMeta } from "./types";

export const LB_KIND_METADATA = {
  "daily-jams": {
    label: "Daily Jams",
    tag: "Refreshes daily",
    blurb: "A comfortable background mix of recordings you already love, regenerated every morning.",
    icon: Sun,
    acc: "daily",
  },
  "weekly-jams": {
    label: "Weekly Jams",
    tag: "Refreshes Mondays",
    blurb: "Songs you've listened to before, arranged into a playlist that doesn't require active listening.",
    icon: Repeat,
    acc: "weekly",
  },
  "weekly-exploration": {
    label: "Weekly Exploration",
    tag: "Refreshes Mondays",
    blurb: "Discover new music. Tracks you haven't heard before, selected by the collaborative-filtering algorithm.",
    icon: Compass,
    acc: "explore",
  },
  "cf-recommendations": {
    label: "CF Recommendations",
    tag: "Raw recording pool",
    blurb: "Your raw collaborative-filtering output recording MBIDs ranked by score.",
    icon: Sparkles,
    acc: "cf",
  },
} as const satisfies Record<LbPlaylistKind, LbKindMeta>;

export const EMPTY_REASON_LABELS: Record<string, string> = {
  "no-data": "No data yet",
  "no-resolved": "Couldn't match recordings",
  "playlist-not-generated-yet": "Waiting for ListenBrainz",
  "fetch-error": "Sync failed, will retry",
};

export const DISCOVERY_SETTINGS_HREF = "/settings/integrations/metadata#listenbrainz";

export const AUTO_REQUEST_TOOLTIP =
  "Auto-request is enabled, playlists are created automatically when the feed refreshes.";

export const SKELETON_PLACEHOLDERS = [0, 1, 2, 3] as const;

export const EMPTY_STATE_COPY = {
  error: { text: "Couldn't load your discovery mixes.", cta: null },
  disabled: { text: "Enable ListenBrainz to see your weekly mixes here.", cta: "Open settings" },
  "no-username": { text: "Add your ListenBrainz username to start syncing mixes.", cta: "Configure ListenBrainz" },
  "no-kinds": { text: "Pick which playlists to fetch in settings.", cta: "Choose playlists" },
} as const;
