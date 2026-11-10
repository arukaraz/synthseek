import type { BoardDevice } from "@components/BoardGrid";

export const TEMPLATE_FILE_ACCEPT = ".json,application/json";

export const PREVIEW_BOARD_WIDTH_PX: Record<BoardDevice, number> = { wide: 1200, narrow: 390 };

export const BOARD_SETTINGS_TABS = ["appearance", "templates"] as const;

export const BOARD_SETTINGS_TAB_KEYS = {
  appearance: "widgets:board.appearance.title",
  templates: "widgets:board.templates.title",
} as const;

export const TEMPLATE_SKIPPED_KEYS = {
  items: "widgets:board.templates.skipped",
  mobile: "widgets:board.templates.skippedMobile",
} as const;

export const TEMPLATES_DOCS_URL = "https://docs.synthseek.dev/widget-templates";
