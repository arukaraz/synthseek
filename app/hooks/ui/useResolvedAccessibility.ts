import { useSyncExternalStore } from "react";

import { readResolvedAccessibility, subscribeAccessibility } from "@modules/accessibility";

export function useTransparencyReduced(): boolean {
  return useSyncExternalStore(
    subscribeAccessibility,
    () => readResolvedAccessibility().transparencyReduced,
    () => false
  );
}

export function useMoreContrast(): boolean {
  return useSyncExternalStore(
    subscribeAccessibility,
    () => readResolvedAccessibility().moreContrast,
    () => false
  );
}
