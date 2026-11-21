import type { ParseKeys } from "i18next";

import type { AppErrorCode } from "@modules/errors";
import { THEME_FONTS_PATH } from "@theme/custom";

export const THEME_CHANGED_ELSEWHERE = "THEME_CHANGED_ELSEWHERE" satisfies AppErrorCode;

export const THEME_FONT_UPLOAD_PATH = THEME_FONTS_PATH;

export const THEME_FONT_FIELD = "font";

export const FONT_ERROR_KEYS = {
  THEME_FONT_UNSUPPORTED: "theme.fontUnsupported",
  THEME_FONT_TOO_LARGE: "theme.fontTooLarge",
} as const satisfies Record<string, ParseKeys<"mutations">>;

export const FONT_ERROR_FALLBACK_KEY = "theme.fontUploadFailed" satisfies ParseKeys<"mutations">;
