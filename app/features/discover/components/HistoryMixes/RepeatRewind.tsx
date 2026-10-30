"use client";

import { useRepeatRewind } from "@hooks/api/queries/analytics/useRepeatRewind";

import { HistoryMix } from "./HistoryMix";
import type { HistoryMixWidgetProps } from "./types";

export function RepeatRewind({ size, info }: HistoryMixWidgetProps) {
  return <HistoryMix kind="rewind" query={useRepeatRewind()} size={size} info={info} />;
}
