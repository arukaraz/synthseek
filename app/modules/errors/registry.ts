import i18n from "@locale";

import type { AppErrorCode } from "./appCode";
import { ERROR_META, matchCode } from "./constants";
import type { ErrorCategory, FriendlyError } from "./types";

export function resolveByCode(appCode: AppErrorCode): FriendlyError {
  const meta = ERROR_META[appCode];
  return {
    title: i18n.t(`errors:${appCode}.title`),
    description: i18n.t(`errors:${appCode}.description`),
    severity: meta?.severity ?? "error",
    duration: meta?.duration,
  };
}

export function resolveByMessage(message: string, preferredCategory?: ErrorCategory): FriendlyError | null {
  const code = matchCode(message, preferredCategory);
  return code ? resolveByCode(code) : null;
}
