import type { CSSProperties } from "react";

import { ANNOUNCE_MILESTONE_STEP } from "./constants";

export function fillStyle(ratio: number): CSSProperties {
  return { inlineSize: `${Math.round(ratio * 100)}%` };
}

export function clampRatio(value: number, max: number): number {
  if (max <= 0) return 0;
  const ratio = value / max;
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

export function isAnnounceMilestone(value: number, max: number): boolean {
  if (value <= 0) return false;
  if (value >= max) return true;
  return value % ANNOUNCE_MILESTONE_STEP === 0;
}
