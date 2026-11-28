import { DEFAULT_ACCESSIBILITY, DEFAULT_TEXT_SIZE } from "@modules/accessibility";

import type { AccessibilityContextValue } from "./types";

export const FALLBACK_ACCESSIBILITY_CONTEXT: AccessibilityContextValue = {
  ...DEFAULT_ACCESSIBILITY,
  motionReduced: false,
  transparencyReduced: false,
  moreContrast: false,
  signedIn: false,
  textSize: DEFAULT_TEXT_SIZE,
  update: () => undefined,
  setTextSize: () => undefined,
};
