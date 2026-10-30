import type { PointerEvent as ReactPointerEvent } from "react";

import type { BoardDevice, BoardMetrics } from "@components/BoardGrid";
import type { BoardAppearance, BoardItem } from "@hooks/api/queries/board/types";

import type {
  BoardCustomWidgets,
  BoardTileLayoutActions,
  CustomWidgetsStatus,
  PlacedTile,
} from "../ExploreBoard/types";

export interface ArrangeSpace {
  width: number;
  height: number;
}

export interface ArrangeLayout {
  scale: number;
  width: number;
  rowPx: number;
  gapPx: number;
}

export interface BoardArrangeDialogProps {
  items: readonly BoardItem[];
  device: BoardDevice;
  boardWidth: number;
  appearance?: BoardAppearance;
  custom: BoardCustomWidgets;
  customStatus: CustomWidgetsStatus;
  onSave: (next: BoardItem[]) => void;
  onClose: () => void;
}

export interface ArrangeTileProps {
  tile: PlacedTile;
  device: BoardDevice;
  boardWidth: number;
  metrics: BoardMetrics;
  layout: ArrangeLayout;
  custom: BoardCustomWidgets;
  customStatus: CustomWidgetsStatus;
  dragging: boolean;
  position: number;
  total: number;
  actions: BoardTileLayoutActions;
}

export interface ArrangeTileBarProps {
  item: BoardItem;
  device: BoardDevice;
  name: string;
  position: number;
  total: number;
  actions: BoardTileLayoutActions;
}

export interface UseBoardArrangeOptions {
  items: readonly BoardItem[];
  custom: BoardCustomWidgets;
}

export type StartsTileDragEvent = Pick<ReactPointerEvent<HTMLElement>, "pointerType" | "target" | "currentTarget">;
