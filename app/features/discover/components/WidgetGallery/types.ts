import type { ReactNode } from "react";

import type { BoardList, BoardLists, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDocument, WidgetDraft } from "@hooks/api/queries/widgets/types";

import type { BoardCategory, BoardWidgetDefinition } from "../ExploreBoard/types";

export type GalleryMode = "widgets" | "mine";

export type GalleryCategoryFilter = "all" | BoardCategory;

export type GalleryBoardFilter = "all" | "on" | "off";

export type GallerySort = "suggested" | "name" | "category" | "onBoardFirst";

export type SortDirection = "asc" | "desc";

export interface GalleryFilters {
  query: string;
  category: GalleryCategoryFilter;
  board: GalleryBoardFilter;
  sort: GallerySort;
  direction: SortDirection;
}

export interface GalleryEntry {
  widget: BoardWidgetKey;
  definition: BoardWidgetDefinition;
  title: string;
  description: string;
}

export interface GalleryGroup {
  category: BoardCategory | null;
  entries: GalleryEntry[];
  onBoard: number;
}

export interface PreviewBox {
  width: number;
  height: number;
}

export interface PreviewFrame extends PreviewBox {
  stageWidth: number;
  stageHeight: number;
  scale: number;
}

export type GalleryLeave = "back" | "close";

export interface LayoutPlacement {
  placed: BoardList[];
  free: BoardList[];
}

export type PickLayouts = (lists: readonly BoardList[]) => void;

export interface LayoutMenuProps {
  lists: readonly BoardList[];
  tone: "add" | "remove";
  label: string;
  ariaLabel: string;
  onPick: PickLayouts;
}

export interface LockedActionProps {
  label: string;
  hint: string;
  children: ReactNode;
}

export interface ClampedTextProps {
  text: string;
  className?: string;
}

export interface WidgetGalleryCardProps {
  entry: GalleryEntry;
  placed: readonly BoardList[];
  free: readonly BoardList[];
  onAdd: (widget: BoardWidgetKey, lists: readonly BoardList[]) => void;
  onRemove: (widget: BoardWidgetKey, lists: readonly BoardList[]) => void;
  onCustomize?: () => void;
}

export interface WidgetPreviewProps {
  widget: BoardWidgetKey;
}

export interface CustomWidgetPreviewProps {
  widget: WidgetDocument;
}

export interface ScaledPreviewProps {
  frame: PreviewFrame;
  children: ReactNode;
}

export interface CategoryBandProps {
  category: BoardCategory;
  onBoard: number;
  total: number;
}

export interface GalleryFilterMenuProps {
  filters: GalleryFilters;
  counts: ReadonlyMap<GalleryCategoryFilter, number>;
  onChange: (filters: GalleryFilters) => void;
}

export interface MyWidgetsPanelProps {
  widgets: readonly WidgetDocument[];
  lists: BoardLists;
  onAddCustom: (widget: WidgetDocument, lists: readonly BoardList[]) => void;
  onEdit: (widget: WidgetDocument) => void;
  onCreate: () => void;
  onImport: () => void;
  onDeleted: (widgetId: string) => void;
}

export interface MyWidgetCardProps {
  widget: WidgetDocument;
  free: readonly BoardList[];
  onAdd: PickLayouts;
  onEdit: () => void;
  onDuplicate: () => void;
  onCopyJson: () => void;
  onDelete: () => void;
}

export interface NewWidgetCardProps {
  onCreate: () => void;
  onImport: () => void;
}

export interface DeleteWidgetDialogProps {
  widget: WidgetDocument | null;
  tiles: number;
  onCancel: () => void;
  onConfirm: (widget: WidgetDocument) => void;
}

export interface ImportWidgetDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: (draft: WidgetDraft) => void;
}
