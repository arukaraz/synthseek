import { Blocks, Contrast, FileText, LayoutDashboard, type LucideIcon } from "lucide-react";

import type { BoardDevice } from "@components/BoardGrid";

import type { CustomizationSection } from "../ExploreBoard/types";
import type { PhonePane } from "./types";

export const CUSTOMIZATION_SECTIONS: readonly CustomizationSection[] = ["board", "widgets"];

export const CUSTOMIZATION_SECTION_KEYS = {
  board: "widgets:board.customization.sections.board",
  widgets: "widgets:board.customization.sections.widgets",
} as const;

export const CUSTOMIZATION_SECTION_ICONS: Record<CustomizationSection, LucideIcon> = {
  board: LayoutDashboard,
  widgets: Blocks,
};

export const PHONE_PANES: readonly PhonePane[] = ["arrange", "appearance", "templates", "widgets"];

export const PHONE_PANE_KEYS = {
  arrange: "widgets:board.customization.sections.arrange",
  appearance: "widgets:board.appearance.title",
  templates: "widgets:board.templates.title",
  widgets: "widgets:board.customization.sections.widgets",
} as const;

export const PHONE_PANE_ICONS: Record<PhonePane, LucideIcon> = {
  arrange: LayoutDashboard,
  appearance: Contrast,
  templates: FileText,
  widgets: Blocks,
};

export const NAV_KEY_DELTAS: ReadonlyMap<string, number> = new Map([
  ["ArrowDown", 1],
  ["ArrowRight", 1],
  ["ArrowUp", -1],
  ["ArrowLeft", -1],
]);

export const PREVIEW_BOARD_WIDTH_PX: Record<BoardDevice, number> = { wide: 1200, narrow: 390 };
