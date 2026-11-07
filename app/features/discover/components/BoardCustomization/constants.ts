import { Blocks, LayoutDashboard, type LucideIcon } from "lucide-react";

import type { BoardDevice } from "@components/BoardGrid";

import type { CustomizationSection } from "../ExploreBoard/types";

export const CUSTOMIZATION_SECTIONS: readonly CustomizationSection[] = ["board", "widgets"];

export const CUSTOMIZATION_SECTION_KEYS = {
  board: "widgets:board.customization.sections.board",
  widgets: "widgets:board.customization.sections.widgets",
} as const;

export const CUSTOMIZATION_SECTION_ICONS: Record<CustomizationSection, LucideIcon> = {
  board: LayoutDashboard,
  widgets: Blocks,
};

export const NAV_KEY_DELTAS: ReadonlyMap<string, number> = new Map([
  ["ArrowDown", 1],
  ["ArrowRight", 1],
  ["ArrowUp", -1],
  ["ArrowLeft", -1],
]);

export const PREVIEW_BOARD_WIDTH_PX: Record<BoardDevice, number> = { wide: 1200, narrow: 390 };
