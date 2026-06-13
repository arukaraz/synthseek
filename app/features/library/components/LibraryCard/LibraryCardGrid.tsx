"use client";

import { cardGrid } from "./styles";
import type { LibraryCardGridProps } from "./types";

export function LibraryCardGrid({ children, ariaLabel }: LibraryCardGridProps) {
  return (
    <ul className={cardGrid()} aria-label={ariaLabel}>
      {children}
    </ul>
  );
}
