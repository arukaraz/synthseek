"use client";

import type { PlexMarkProps } from "../types";

export function PlexMark({ size = 18 }: PlexMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 2h6l5 10-5 10H7l5-10L7 2z" />
    </svg>
  );
}
