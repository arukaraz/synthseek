import type { A11yPreference } from "@modules/accessibility";

import type { AccessibilityPatch, PreferenceKey } from "./types";

export function preferencePatch(key: PreferenceKey, choice: A11yPreference): AccessibilityPatch {
  switch (key) {
    case "motion":
      return { motion: choice };
    case "transparency":
      return { transparency: choice };
    case "contrast":
      return { contrast: choice };
  }
}
