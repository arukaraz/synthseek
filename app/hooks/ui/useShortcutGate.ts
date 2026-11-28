import { useCallback, useRef } from "react";

import { shortcutAllowed, type ShortcutKeyEvent } from "@modules/accessibility";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";

export function useShortcutGate(): (event: ShortcutKeyEvent) => boolean {
  const { singleKeyShortcuts } = useAccessibility();
  const latest = useRef(singleKeyShortcuts);
  latest.current = singleKeyShortcuts;
  return useCallback((event: ShortcutKeyEvent) => shortcutAllowed(event, latest.current), []);
}
