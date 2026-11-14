import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, PointerEvent as ReactPointerEvent, RefObject } from "react";

import type { BoardDevice } from "@components/BoardGrid";
import type { BoardWriteMode } from "@hooks/api/mutations/board/types";
import type {
  BoardAppearance,
  BoardItem,
  BoardLists,
  BoardRowHeight,
  BoardSize,
  BoardTemplateApplied,
  BoardWidgetKey,
} from "@hooks/api/queries/board/types";
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
  defaultSize: BoardSize;
  lockedTo?: BoardSize;
}

export interface PlacedTile {
  item: BoardItem;
  size: BoardSize;
  col: number;
  row: number;
  cols: number;
  rows: number;
  rowSized: boolean;
}

export interface BoardRow {
  id: string;
  position: number;
  row: number;
  rows: number;
  height: BoardRowHeight;
  sizable: boolean;
  itemIds: string[];
}

export interface PackedBoard {
  tiles: PlacedTile[];
  rows: BoardRow[];
}

export interface BoardRowFrameProps {
  row: BoardRow;
  onHeight: (row: BoardRow, height: BoardRowHeight) => void;
}

export type MoveDelta = -1 | 1;

export type BoardEdge = "top" | "bottom";

export type BoardBackground = "on" | "off";

export interface BoardSave {
  lists: BoardLists | null;
  appearance: { next: BoardAppearance; previous: BoardAppearance } | null;
}

export interface BoardSaver {
  saveChanges: (changes: BoardSave, mode?: BoardWriteMode) => Promise<boolean>;
  templateApplied: (applied: BoardTemplateApplied) => void;
}

export interface WidgetsDialogOpening {
  target: BoardGalleryTarget | null;
}

export type BoardKeyAction =
  | { kind: "move"; delta: MoveDelta }
  | { kind: "resize"; delta: MoveDelta }
  | { kind: "remove" };

export interface BoardTileLayoutActions {
  move: (id: string, delta: MoveDelta) => void;
  moveToEdge: (id: string, edge: BoardEdge) => void;
  resize: (id: string, size: BoardSize) => void;
  resizeSpacer: (id: string, delta: MoveDelta) => void;
  toggleBackground: (id: string) => void;
  remove: (id: string) => void;
  startDrag: (event: ReactPointerEvent<HTMLElement>, id: string) => void;
}

export interface BoardTileActions extends BoardTileLayoutActions {
  customize: (widget: BoardWidgetKey) => void;
  edit: (widgetId: string) => void;
}

export type BoardGalleryTarget = { kind: "builtin"; widget: BoardWidgetKey } | { kind: "custom"; widgetId: string };

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
  custom: BoardCustomWidgets;
  editable: boolean;
  rowSized: boolean;
  position: number;
  total: number;
  actions: BoardTileActions;
}

export interface TileMenuOpener {
  icon: LucideIcon;
  label: string;
  onSelect: () => void;
}

export interface TileSettingsMenuProps {
  item: BoardItem;
  device: BoardDevice;
  name: string;
  rowSized: boolean;
  position: number;
  total: number;
  dense?: boolean;
  actions: BoardTileLayoutActions;
  opener?: TileMenuOpener;
}

export interface BoardTileWidgetProps {
  item: BoardItem;
  size: BoardSize;
  custom: BoardCustomWidgets;
  customStatus: CustomWidgetsStatus;
  info?: boolean;
}

export interface BoardTileContentProps extends BoardTileWidgetProps {
  info: boolean;
}

export interface BoardTileSizesProps {
  item: BoardItem;
  name: string;
  custom: BoardCustomWidgets;
  dense?: boolean;
  onResize: (id: string, size: BoardSize) => void;
}

export interface BoardToolbarProps {
  editing: boolean;
  onCustomize: () => void;
  onDone: () => void;
  onAddSpacer: () => void;
  onWidgets: () => void;
}

export interface BoardEmptyProps {
  onAddWidget: () => void;
}

export interface BoardEditor {
  rootRef: RefObject<HTMLElement | null>;
  editing: boolean;
  widgets: WidgetsDialogOpening | null;
  announcement: string;
  displayItems: BoardItem[];
  draggingId: string | null;
  startEditing: () => void;
  stopEditing: () => void;
  openWidgets: () => void;
  closeWidgets: () => void;
  saveBoard: (changes: BoardSave) => void;
  addSpacer: () => void;
  setRowHeight: (row: BoardRow, height: BoardRowHeight) => void;
  actions: BoardTileActions;
}
