import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, PointerEvent as ReactPointerEvent, RefObject } from "react";

import type { BoardDevice, BoardHeight } from "@components/BoardGrid";
import type { BoardItem, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";

export type BoardCategory = "now" | "history" | "discover" | "library";

export type BoardCustomWidgets = ReadonlyMap<string, WidgetDocument>;

export type CustomWidgetsStatus = "loading" | "error" | "ready";

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
  sizes: Partial<Record<BoardSize, BoardHeight>>;
  defaultSize: BoardSize;
  narrowSizes?: Partial<Record<BoardSize, BoardSize>>;
}

export interface PlacedTile {
  item: BoardItem;
  size: BoardSize;
  col: number;
  row: number;
  cols: number;
  rows: number;
}

export type MoveDelta = -1 | 1;

export type BoardKeyAction =
  | { kind: "move"; delta: MoveDelta }
  | { kind: "resize"; delta: MoveDelta }
  | { kind: "remove" };

export interface BoardTileActions {
  move: (id: string, delta: MoveDelta) => void;
  resize: (id: string, size: BoardSize) => void;
  remove: (id: string) => void;
  startDrag: (event: ReactPointerEvent<HTMLElement>, id: string) => void;
}

export interface BoardTileProps {
  tile: PlacedTile;
  device: BoardDevice;
  custom: BoardCustomWidgets;
  customStatus: CustomWidgetsStatus;
  editing: boolean;
  dragging: boolean;
  position: number;
  total: number;
  actions: BoardTileActions;
}

export interface BoardTileEditControlsProps {
  item: BoardItem;
  device: BoardDevice;
  name: string;
  position: number;
  total: number;
  actions: BoardTileActions;
}

export interface BoardToolbarProps {
  editing: boolean;
  onCustomize: () => void;
  onDone: () => void;
  onAddWidget: () => void;
}

export interface BoardEmptyProps {
  onAddWidget: () => void;
}

export interface BoardEditor {
  rootRef: RefObject<HTMLElement | null>;
  editing: boolean;
  galleryOpen: boolean;
  announcement: string;
  displayItems: BoardItem[];
  draggingId: string | null;
  startEditing: () => void;
  stopEditing: () => void;
  openGallery: () => void;
  setGalleryOpen: (open: boolean) => void;
  add: (widget: BoardWidgetKey) => void;
  actions: BoardTileActions;
}
