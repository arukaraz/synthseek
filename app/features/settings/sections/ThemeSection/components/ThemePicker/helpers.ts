import type { CustomThemeSummary, Theme } from "@theme/ThemeProvider";
import type { CssVars } from "@theme/utilities/types";

import { FALLBACK_PREVIEW_THEME, ROVING_KEYS } from "./constants";
import type { RovingNavKey, ThemePreviewPaint } from "./types";

export function isRovingKey(key: string): key is RovingNavKey {
  return ROVING_KEYS.some((rovingKey) => rovingKey === key);
}

export function nextRovingIndex(current: number, count: number, key: RovingNavKey): number {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
  }
}

export function previewPaintOf(
  value: Theme,
  custom: CustomThemeSummary | null,
  active: Theme,
  savedVars?: CssVars
): ThemePreviewPaint {
  if (value !== "custom") return { theme: value };
  if (custom !== null) return { theme: "custom", base: custom.startedFrom, vars: savedVars };
  return { theme: active === "custom" ? FALLBACK_PREVIEW_THEME : active };
}
