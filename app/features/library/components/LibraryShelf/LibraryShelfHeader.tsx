"use client";

import { ShelfActiveChips } from "./ShelfActiveChips";
import { ShelfControls } from "./ShelfControls";
import { ShelfTitleBar } from "./ShelfTitleBar";
import { ShelfViewPills } from "./ShelfViewPills";
import { shelfFold, shelfFoldInner, shelfHeader } from "./styles";
import type { LibraryShelfHeaderProps } from "./types";

export function LibraryShelfHeader({ controller, total, facets, shell, collapsed }: LibraryShelfHeaderProps) {
  return (
    <div className={shelfHeader()}>
      <ShelfTitleBar controller={controller} total={total} collapsed={collapsed} />
      <div className={shelfFold({ collapsed })} inert={collapsed} data-shelf-fold>
        <div className={shelfFoldInner()}>
          <ShelfViewPills view={controller.view} onViewChange={shell.onViewChange} />
          <ShelfControls controller={controller} onOpenFilters={() => shell.onFiltersOpenChange(true)} shell={shell} />
          <ShelfActiveChips controller={controller} facets={facets} />
        </div>
      </div>
    </div>
  );
}
