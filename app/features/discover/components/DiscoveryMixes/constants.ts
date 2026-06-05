import type { ParseKeys } from "i18next";
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

export const EMPTY_REASON_KEYS: Record<string, ParseKeys<"discover">> = {
  "no-data": "mixes.emptyReason.noData",
  "no-resolved": "mixes.emptyReason.noResolved",
  "playlist-not-generated-yet": "mixes.emptyReason.notGenerated",
  "fetch-error": "mixes.emptyReason.fetchError",
};

export const EMPTY_REASON_FALLBACK_KEY: ParseKeys<"discover"> = "mixes.emptyReason.feedEmpty";

export const WAITING_FIRST_SYNC_KEY: ParseKeys<"discover"> = "mixes.emptyReason.waitingFirstSync";

export const DISCOVERY_SETTINGS_HREF = "/settings/integrations/metadata#listenbrainz";

export const SKELETON_PLACEHOLDERS = [0, 1, 2, 3] as const;

export const EMPTY_CTA = {
  error: null,
  disabled: "open-settings",
  "no-username": "configure",
  "no-kinds": "choose-playlists",
} as const;
