"use client";

import { useRepeatRewind } from "@hooks/api/queries/analytics/useRepeatRewind";

import { HistoryMix } from "./HistoryMix";
import type { HistoryMixWidgetProps } from "./types";

export function RepeatRewind({ info }: HistoryMixWidgetProps) {
  return <HistoryMix kind="rewind" query={useRepeatRewind()} info={info} />;
}
