"use client";

import { ShelfActiveChips } from "./ShelfActiveChips";
import { ShelfControls } from "./ShelfControls";
import { ShelfTitleBar } from "./ShelfTitleBar";
import { ShelfViewPills } from "./ShelfViewPills";
import { shelfHeader } from "./styles";
import type { LibraryShelfHeaderProps } from "./types";

export function LibraryShelfHeader({ controller, total, facets, shell }: LibraryShelfHeaderProps) {
  return (
    <div className={shelfHeader()}>
      <ShelfTitleBar controller={controller} total={total} />
      <ShelfViewPills view={controller.view} onViewChange={shell.onViewChange} />
      <ShelfControls controller={controller} onOpenFilters={() => shell.onFiltersOpenChange(true)} shell={shell} />
      <ShelfActiveChips controller={controller} facets={facets} />
    </div>
  );
}
