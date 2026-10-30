import { Heart, History, Repeat, Shovel } from "lucide-react";

import type { BoardSize } from "@hooks/api/queries/board/types";

import type { PlaySetLayout } from "../PlaySetCard/types";
import type { HistoryMixConfig, HistoryMixKind } from "./types";

export const HISTORY_MIX_LAYOUTS: Record<BoardSize, PlaySetLayout> = { S: "stack", M: "side", L: "banner" };

export const HISTORY_MIXES: Record<HistoryMixKind, HistoryMixConfig> = {
  onRepeat: {
    accent: "daily",
    icon: Repeat,
    titleKey: "history.onRepeat.title",
    tagKey: "history.onRepeat.tag",
    blurbKey: "history.onRepeat.blurb",
    emptyKey: "history.onRepeat.empty",
  },
  rewind: {
    accent: "weekly",
    icon: History,
    titleKey: "history.rewind.title",
    tagKey: "history.rewind.tag",
    blurbKey: "history.rewind.blurb",
    emptyKey: "history.rewind.empty",
  },
  deepCuts: {
    accent: "explore",
    icon: Shovel,
    titleKey: "history.deepCuts.title",
    tagKey: "history.deepCuts.tag",
    blurbKey: "history.deepCuts.blurb",
    emptyKey: "history.deepCuts.empty",
  },
  forgottenFavorites: {
    accent: "cf",
    icon: Heart,
    titleKey: "history.forgottenFavorites.title",
    tagKey: "history.forgottenFavorites.tag",
    blurbKey: "history.forgottenFavorites.blurb",
    emptyKey: "history.forgottenFavorites.empty",
  },
};
