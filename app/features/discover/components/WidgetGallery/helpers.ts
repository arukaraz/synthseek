import { BOARD_COLUMNS, BOARD_GAP_PX, BOARD_ROW_PX, FAMILY_SPANS } from "@components/BoardGrid";
import type { BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";

import { BOARD_CATEGORY_ORDER } from "../ExploreBoard/constants";
import type { BoardCategory } from "../ExploreBoard/types";
import { PREVIEW_BOARD_WIDTH, PREVIEW_BOX } from "./constants";
import type { GalleryEntry, GalleryFilter, GalleryGroup, PreviewFrame } from "./types";

export function matchesQuery(entry: GalleryEntry, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return [entry.title, entry.description].some((text) => text.toLocaleLowerCase().includes(needle));
}

export function galleryGroups(
  entries: readonly GalleryEntry[],
  query: string,
  filter: GalleryFilter,
  onBoard: ReadonlyMap<BoardWidgetKey, string>
): GalleryGroup[] {
  const searching = query.trim() !== "";
  const categories = filter === "all" || searching ? BOARD_CATEGORY_ORDER : [filter];
  return categories
    .map((category) => {
      const matching = entries.filter((entry) => entry.definition.category === category && matchesQuery(entry, query));
      return {
        category,
        entries: matching,
        onBoard: matching.filter((entry) => onBoard.has(entry.widget)).length,
      };
    })
    .filter((group) => group.entries.length > 0);
}

export function countInCategory(entries: readonly GalleryEntry[], category: BoardCategory): number {
  return entries.filter((entry) => entry.definition.category === category).length;
}

export function previewFrame(size: BoardSize): PreviewFrame {
  const columns = BOARD_COLUMNS.wide;
  const column = (PREVIEW_BOARD_WIDTH - (columns - 1) * BOARD_GAP_PX) / columns;
  const span = FAMILY_SPANS.wide[size];
  const stageWidth = span.cols * column + (span.cols - 1) * BOARD_GAP_PX;
  const stageHeight = span.rows * BOARD_ROW_PX + (span.rows - 1) * BOARD_GAP_PX;
  const scale = Math.min(PREVIEW_BOX.width / stageWidth, PREVIEW_BOX.height / stageHeight);
  return {
    stageWidth,
    stageHeight,
    scale,
    width: Math.round(stageWidth * scale),
    height: Math.round(stageHeight * scale),
  };
}
