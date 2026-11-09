"use client";

import { useOnRepeat } from "@hooks/api/queries/analytics/useOnRepeat";

import { HistoryMix } from "./HistoryMix";
import type { HistoryMixWidgetProps } from "./types";

export function OnRepeat({ info }: HistoryMixWidgetProps) {
  return <HistoryMix kind="onRepeat" query={useOnRepeat()} info={info} />;
}
