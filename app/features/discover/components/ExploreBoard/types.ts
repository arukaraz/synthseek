import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, PointerEvent as ReactPointerEvent, RefObject } from "react";

import type { BoardDevice, BoardHeight } from "@components/BoardGrid";
import type { BoardItem, BoardSize, BoardTemplateApplied, BoardWidgetKey } from "@hooks/api/queries/board/types";
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
  sizes: Record<BoardSize, BoardHeight>;
  defaultSize: BoardSize;
}

export interface PlacedTile {
  item: BoardItem;
  size: BoardSize;
  col: number;
  row: number;
  cols: number;
  rows: number;
}

export type WidgetTile = Exclude<BoardItem, { kind: "spacer" }>;

export type MoveDelta = -1 | 1;

export type BoardEdge = "top" | "bottom";

export type BoardBackground = "on" | "off" | "mixed";

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
  editable: boolean;
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
  device: BoardDevice;
  name: string;
  dense?: boolean;
  onResize: (id: string, size: BoardSize) => void;
}

export interface BoardToolbarProps {
  editing: boolean;
  onCustomize: () => void;
  onDone: () => void;
  onManageWidgets: () => void;
  onAddSpacer: () => void;
  onArrange: () => void;
  onTemplates: () => void;
  background: BoardBackground;
  onBackground: (shown: boolean) => void;
}

export interface BoardEmptyProps {
  onAddWidget: () => void;
}

export interface BoardEditor {
  rootRef: RefObject<HTMLElement | null>;
  editing: boolean;
  galleryOpen: boolean;
  templatesOpen: boolean;
  arrangeWidth: number | null;
  announcement: string;
  displayItems: BoardItem[];
  draggingId: string | null;
  startEditing: () => void;
  stopEditing: () => void;
  openGallery: () => void;
  setGalleryOpen: (open: boolean) => void;
  openArrange: () => void;
  closeArrange: () => void;
  openTemplates: () => void;
  closeTemplates: () => void;
  saveArrangement: (next: BoardItem[]) => void;
  galleryTarget: BoardGalleryTarget | null;
  add: (widget: BoardWidgetKey) => void;
  addCustom: (widget: WidgetDocument) => void;
  addSpacer: () => void;
  setBackgrounds: (shown: boolean) => void;
  templateApplied: (applied: BoardTemplateApplied) => void;
  actions: BoardTileActions;
}
