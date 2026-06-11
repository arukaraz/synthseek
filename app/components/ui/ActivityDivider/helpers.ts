import type { CSSProperties } from "react";

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
