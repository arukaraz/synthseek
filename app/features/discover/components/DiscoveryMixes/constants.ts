import type { ParseKeys } from "i18next";
import { Compass, Repeat, Sparkles, Sun } from "lucide-react";

import type { LbPlaylistKind } from "@features/discovery-integrations/types";

import type { LbKindMeta } from "./types";

export const LB_KIND_METADATA = {
  "daily-jams": {
    label: "Daily Jams",
    icon: Sun,
    acc: "daily",
  },
  "weekly-jams": {
    label: "Weekly Jams",
    icon: Repeat,
    acc: "weekly",
  },
  "weekly-exploration": {
    label: "Weekly Exploration",
    icon: Compass,
    acc: "explore",
  },
  "cf-recommendations": {
    label: "CF Recommendations",
    icon: Sparkles,
    acc: "cf",
  },
} as const satisfies Record<LbPlaylistKind, LbKindMeta>;

export const LB_KIND_LABEL_KEYS: Record<LbPlaylistKind, ParseKeys<"discover">> = {
  "daily-jams": "mixes.kinds.dailyJams.label",
  "weekly-jams": "mixes.kinds.weeklyJams.label",
  "weekly-exploration": "mixes.kinds.weeklyExploration.label",
  "cf-recommendations": "mixes.kinds.cfRecommendations.label",
};

export const LB_KIND_TAG_KEYS: Record<LbPlaylistKind, ParseKeys<"discover">> = {
  "daily-jams": "mixes.kinds.dailyJams.tag",
  "weekly-jams": "mixes.kinds.weeklyJams.tag",
  "weekly-exploration": "mixes.kinds.weeklyExploration.tag",
  "cf-recommendations": "mixes.kinds.cfRecommendations.tag",
};

export const LB_KIND_BLURB_KEYS: Record<LbPlaylistKind, ParseKeys<"discover">> = {
  "daily-jams": "mixes.kinds.dailyJams.blurb",
  "weekly-jams": "mixes.kinds.weeklyJams.blurb",
  "weekly-exploration": "mixes.kinds.weeklyExploration.blurb",
  "cf-recommendations": "mixes.kinds.cfRecommendations.blurb",
};

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
