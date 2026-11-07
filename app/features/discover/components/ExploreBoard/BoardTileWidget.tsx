"use client";

import { memo } from "react";

import { BoardTileContent } from "./BoardTileContent";
import { tileHasBackground } from "./helpers";
import { tileSurface } from "./styles";
import type { BoardTileWidgetProps } from "./types";

export const BoardTileWidget = memo(function BoardTileWidget({ info = true, ...content }: BoardTileWidgetProps) {
  return (
    <div className={tileSurface({ bare: !tileHasBackground(content.item) })}>
      <BoardTileContent {...content} info={info} />
    </div>
  );
});
