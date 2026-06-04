import type { ParseKeys } from "i18next";

import type { LbPlaylistKind } from "./types";

export const LB_PLAYLIST_KIND_LABEL_KEYS: Record<
  LbPlaylistKind,
  { label: ParseKeys<"library">; description: ParseKeys<"library"> }
> = {
  "cf-recommendations": {
    label: "discoveryIntegrations.playlistKind.cfRecommendationsLabel",
    description: "discoveryIntegrations.playlistKind.cfRecommendationsDesc",
  },
  "weekly-exploration": {
    label: "discoveryIntegrations.playlistKind.weeklyExplorationLabel",
    description: "discoveryIntegrations.playlistKind.weeklyExplorationDesc",
  },
  "weekly-jams": {
    label: "discoveryIntegrations.playlistKind.weeklyJamsLabel",
    description: "discoveryIntegrations.playlistKind.weeklyJamsDesc",
  },
  "daily-jams": {
    label: "discoveryIntegrations.playlistKind.dailyJamsLabel",
    description: "discoveryIntegrations.playlistKind.dailyJamsDesc",
  },
};

export const LB_PLAYLIST_KINDS: ReadonlyArray<LbPlaylistKind> = [
  "cf-recommendations",
  "weekly-exploration",
  "weekly-jams",
  "daily-jams",
];
