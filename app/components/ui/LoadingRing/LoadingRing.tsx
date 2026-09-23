"use client";

import { cn } from "@utils/cn";

import { LOADING_RING_BOX, LOADING_RING_DASH, LOADING_RING_RADIUS, LOADING_RING_STROKE_WIDTH } from "./constants";
import { loadingRing } from "./styles";
import type { LoadingRingProps } from "./types";

export function LoadingRing({ spinning, strokeWidth = LOADING_RING_STROKE_WIDTH, className }: LoadingRingProps) {
  return (
    <svg
      className={cn(loadingRing({ spinning }), className)}
      viewBox={`0 0 ${LOADING_RING_BOX} ${LOADING_RING_BOX}`}
      fill="none"
      aria-hidden
    >
      <circle
        cx={LOADING_RING_BOX / 2}
        cy={LOADING_RING_BOX / 2}
        r={LOADING_RING_RADIUS}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={LOADING_RING_DASH}
        strokeLinecap="round"
      />
    </svg>
  );
}
