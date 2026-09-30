import type { CssVars } from "@theme/utilities/types";

import type { ToastClassnames } from "./types";

export const TOAST_CLASS_NAMES: ToastClassnames = {
  toast: "group",
  icon: "shrink-0",
};

export function toastOffsetVars(mobile: string, wide: string): CssVars {
  return { "--toast-offset-mobile": mobile, "--toast-offset-wide": wide };
}
