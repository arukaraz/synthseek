import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";

import type { ListeningMix } from "@hooks/api/queries/analytics/types";

import type { PlaySetAccent } from "../PlaySetCard/types";

export type HistoryMixKind = "onRepeat" | "rewind" | "deepCuts" | "forgottenFavorites";

export interface HistoryMixConfig {
  accent: PlaySetAccent;
  icon: LucideIcon;
  titleKey: ParseKeys<"discover">;
  tagKey: ParseKeys<"discover">;
  blurbKey: ParseKeys<"discover">;
  emptyKey: ParseKeys<"discover">;
}

export interface HistoryMixQuery {
  data: ListeningMix | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface HistoryMixProps {
  kind: HistoryMixKind;
  query: HistoryMixQuery;
  info: string;
}

export interface HistoryMixWidgetProps {
  info: string;
}
