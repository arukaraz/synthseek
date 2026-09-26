"use client";

import type { BrandMarkProps } from "./types";

export function JellyfinMark({ size = 14 }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5 2 20.5h20L12 2.5zm0 7.2 4.4 8H7.6l4.4-8z" fillRule="evenodd" />
    </svg>
  );
}
