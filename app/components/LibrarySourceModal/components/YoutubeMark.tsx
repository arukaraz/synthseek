"use client";

import type { BrandMarkProps } from "./types";

export function YoutubeMark({ size = 16 }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M7 5h10a5 5 0 0 1 5 5v4a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5v-4a5 5 0 0 1 5-5zm3 3.8v6.4l5.4-3.2L10 8.8z"
      />
    </svg>
  );
}
