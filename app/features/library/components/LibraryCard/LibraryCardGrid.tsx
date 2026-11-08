"use client";

import { cardGrid } from "./styles";
import type { LibraryCardGridProps } from "./types";

export function LibraryCardGrid({ children, ariaLabel, density = "comfortable" }: LibraryCardGridProps) {
  return (
    <ul className={cardGrid({ density })} aria-label={ariaLabel} data-library-grid>
      {children}
    </ul>
  );
}
