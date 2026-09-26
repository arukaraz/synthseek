"use client";

import type { BrandMarkProps } from "./types";

export function NavidromeMark({ size = 14 }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"
        fillRule="evenodd"
      />
    </svg>
  );
}
