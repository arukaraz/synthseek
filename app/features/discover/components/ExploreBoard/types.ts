import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

import type { BoardItem, BoardSize } from "@hooks/api/queries/board/types";

export type BoardDevice = "wide" | "narrow";

export type BoardCategory = "now" | "history" | "discover" | "library";

export interface BoardWidgetProps {
  size: BoardSize;
  info: string;
}

export interface BoardWidgetDefinition {
  component: ComponentType<BoardWidgetProps>;
  category: BoardCategory;
  icon: LucideIcon;
  titleKey: ParseKeys<"discover">;
  descriptionKey: ParseKeys<"discover">;
  sizes: readonly BoardSize[];
  defaultSize: BoardSize;
  narrowSizes?: Partial<Record<BoardSize, BoardSize>>;
}

export interface BoardSpan {
  cols: number;
  rows: number;
}

export interface PlacedTile {
  item: BoardItem;
  size: BoardSize;
  col: number;
  row: number;
  cols: number;
  rows: number;
}

export interface BoardTileProps {
  tile: PlacedTile;
}
