import type { BoardItem, BoardWidgetKey } from "@hooks/api/queries/board/types";

import type { BoardCategory, BoardWidgetDefinition } from "../ExploreBoard/types";

export type GalleryFilter = "all" | BoardCategory;

export interface GalleryEntry {
  widget: BoardWidgetKey;
  definition: BoardWidgetDefinition;
  title: string;
  description: string;
}

export interface GalleryGroup {
  category: BoardCategory;
  entries: GalleryEntry[];
  onBoard: number;
}

export interface PreviewFrame {
  width: number;
  height: number;
  stageWidth: number;
  stageHeight: number;
  scale: number;
}

export interface WidgetGalleryProps {
  items: BoardItem[];
  onAdd: (widget: BoardWidgetKey) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export interface WidgetGalleryCardProps {
  entry: GalleryEntry;
  tileId: string | undefined;
  onAdd: (widget: BoardWidgetKey) => void;
  onRemove: (id: string) => void;
}

export interface WidgetPreviewProps {
  widget: BoardWidgetKey;
  info: string;
}

export interface CategoryBandProps {
  category: BoardCategory;
  onBoard: number;
  total: number;
}
