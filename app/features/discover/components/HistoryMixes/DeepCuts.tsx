"use client";

import { useDeepCuts } from "@hooks/api/queries/analytics/useDeepCuts";

import { HistoryMix } from "./HistoryMix";
import type { HistoryMixWidgetProps } from "./types";

export function DeepCuts({ size, info }: HistoryMixWidgetProps) {
  return <HistoryMix kind="deepCuts" query={useDeepCuts()} size={size} info={info} />;
}
