import i18n from "@locale";

import type { AppErrorCode } from "./appCode";
import { ERROR_META, matchCode } from "./constants";
import { formatErrorParams } from "./params";
import type { AppErrorParams, ErrorCategory, FriendlyError } from "./types";

export function resolveByCode(appCode: AppErrorCode, params: AppErrorParams | null = null): FriendlyError {
  const meta = ERROR_META[appCode];
  const values = formatErrorParams(appCode, params);
  return {
    title: i18n.t(`errors:${appCode}.title`, values),
    description: i18n.t(`errors:${appCode}.description`, values),
    severity: meta?.severity ?? "error",
    duration: meta?.duration,
  };
}

export function resolveByMessage(message: string, preferredCategory?: ErrorCategory): FriendlyError | null {
  const code = matchCode(message, preferredCategory);
  return code ? resolveByCode(code) : null;
}
