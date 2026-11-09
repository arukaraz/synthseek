"use client";

import { useDeepCuts } from "@hooks/api/queries/analytics/useDeepCuts";

import { HistoryMix } from "./HistoryMix";
import type { HistoryMixWidgetProps } from "./types";

export function DeepCuts({ info }: HistoryMixWidgetProps) {
  return <HistoryMix kind="deepCuts" query={useDeepCuts()} info={info} />;
}
