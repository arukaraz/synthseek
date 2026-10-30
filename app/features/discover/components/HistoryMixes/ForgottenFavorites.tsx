"use client";

import { useForgottenFavorites } from "@hooks/api/queries/analytics/useForgottenFavorites";

import { HistoryMix } from "./HistoryMix";
import type { HistoryMixWidgetProps } from "./types";

export function ForgottenFavorites({ size, info }: HistoryMixWidgetProps) {
  return <HistoryMix kind="forgottenFavorites" query={useForgottenFavorites()} size={size} info={info} />;
}
