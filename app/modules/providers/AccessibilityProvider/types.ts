import type { ReactNode } from "react";

import type {
  AccessibilityCookie,
  AccessibilitySettings,
  ResolvedAccessibility,
  TextSize,
} from "@modules/accessibility";

export interface AccessibilityProviderProps {
  boot: AccessibilityCookie;
  textSizeBoot?: TextSize;
  children: ReactNode;
}

export interface AccessibilityContextValue extends AccessibilitySettings, ResolvedAccessibility {
  signedIn: boolean;
  textSize: TextSize;
  update: (partial: Partial<AccessibilitySettings>) => void;
  setTextSize: (size: TextSize) => void;
}
