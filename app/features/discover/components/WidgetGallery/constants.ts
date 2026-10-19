import { Compass, History, Library, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { BoardCategory } from "../ExploreBoard/types";

export const PREVIEW_BOX = { width: 300, height: 150 } as const;

export const PREVIEW_BOARD_WIDTH = 1200;

export const GALLERY_CATEGORY_ICONS: Record<BoardCategory, LucideIcon> = {
  now: Radio,
  history: History,
  discover: Compass,
  library: Library,
};
