"use client";

import type { SpotifyMarkProps } from "./types";

export function SpotifyMark({ size = 14 }: SpotifyMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M7 10.2c2.7-0.9 6.8-0.7 9.5 0.6" stroke="#062014" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M7.5 13c2.4-0.7 5.5-0.5 7.5 0.5" stroke="#062014" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M8 15.4c1.8-0.5 4-0.4 5.5 0.3" stroke="#062014" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
