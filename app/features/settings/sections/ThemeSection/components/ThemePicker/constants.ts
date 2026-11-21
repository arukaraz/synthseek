import type { Theme } from "@theme/ThemeProvider";

import type { RovingNavKey } from "./types";

export const THEME_VALUES: ReadonlyArray<Theme> = ["dark", "midnight", "ocean", "custom"];

export const FALLBACK_PREVIEW_THEME: Theme = "dark";

export const ROVING_KEYS: ReadonlyArray<RovingNavKey> = [
  "ArrowRight",
  "ArrowDown",
  "ArrowLeft",
  "ArrowUp",
  "Home",
  "End",
];
