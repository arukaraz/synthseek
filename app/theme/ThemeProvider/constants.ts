import type { ThemePresetId } from "@theme/contract";

import type { Theme, ThemeBoot, ThemeContextValue } from "./types";

export const PRESET_THEMES: readonly ThemePresetId[] = ["dark", "midnight", "ocean"];
export const AVAILABLE_THEMES: readonly Theme[] = [...PRESET_THEMES, "custom"];

export const THEME_COOKIE = "theme";
export const THEME_ATTRIBUTE = "data-theme";
export const THEME_BASE_ATTRIBUTE = "data-theme-base";
export const THEME_SHEET_ID = "theme-sheet";
export const THEME_SHEET_PENDING_ATTRIBUTE = "data-theme-sheet-pending";
export const THEME_DRAFT_ID = "theme-draft";
export const THEME_SHEET_PATH = "/api/v1/theme/sheet";
export const THEME_FINGERPRINT_LENGTH = 16;
export const THEME_COOKIE_SEPARATOR = ".";

export const SAFE_THEME_PARAM = "setTheme";
export const SAFE_THEME_VALUE = "default";

export const THEME_CHANGE_EVENT = "synthseek:theme";

export const THEME_ICON_SELECTOR = 'link[rel~="icon"]';
export const THEME_ICON_SIZE = 64;
export const THEME_ICON_TYPE = "image/png";

export const FACTORY_BOOT: ThemeBoot = { theme: "dark", base: "dark", scheme: "dark", fingerprint: null };

export const FALLBACK_THEME_CONTEXT: ThemeContextValue = {
  theme: FACTORY_BOOT.theme,
  scheme: FACTORY_BOOT.scheme,
  custom: null,
  isReady: false,
  isSelecting: false,
  select: () => undefined,
  draft: null,
  applyDraft: () => undefined,
  previewing: false,
  startPreview: () => undefined,
  stopPreview: () => undefined,
};

const THEME_SHEET_HELD_MEDIA = "not all";

export const THEME_BOOT_SCRIPT = `(function(){try{if(new URLSearchParams(location.search).get("${SAFE_THEME_PARAM}")==="${SAFE_THEME_VALUE}"){var r=document.documentElement;r.setAttribute("${THEME_ATTRIBUTE}","${FACTORY_BOOT.theme}");r.removeAttribute("${THEME_BASE_ATTRIBUTE}");var s=document.getElementById("${THEME_SHEET_ID}");if(s)s.media="${THEME_SHEET_HELD_MEDIA}"}}catch(e){}})()`;
