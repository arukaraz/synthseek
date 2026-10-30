"use client";

import { BoardTileContent } from "./BoardTileContent";
import { tileHasBackground } from "./helpers";
import { tileSurface } from "./styles";
import type { BoardTileWidgetProps } from "./types";

export function BoardTileWidget({ info = true, ...content }: BoardTileWidgetProps) {
  return (
    <div className={tileSurface({ bare: !tileHasBackground(content.item) })}>
      <BoardTileContent {...content} info={info} />
    </div>
  );
}
