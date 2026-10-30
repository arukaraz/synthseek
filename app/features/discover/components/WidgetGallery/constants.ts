import { Compass, History, Library, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { BoardCategory } from "../ExploreBoard/types";
import type { GalleryBoardFilter, GalleryFilters, GalleryMode, GallerySort } from "./types";

export const PREVIEW_BOX = { width: 300, height: 150 } as const;

export const PREVIEW_BOARD_WIDTH = 1200;

export const GALLERY_CATEGORY_ICONS: Record<BoardCategory, LucideIcon> = {
  now: Radio,
  history: History,
  discover: Compass,
  library: Library,
};

export const GALLERY_MODES: readonly GalleryMode[] = ["widgets", "mine", "board"];

export const GALLERY_SORTS: readonly GallerySort[] = ["suggested", "name", "category", "onBoardFirst"];

export const GALLERY_BOARD_FILTERS: readonly GalleryBoardFilter[] = ["all", "on", "off"];

export const DEFAULT_GALLERY_FILTERS: GalleryFilters = {
  query: "",
  category: "all",
  board: "all",
  sort: "suggested",
  direction: "asc",
};

export const BYTES_PER_KB = 1024;
