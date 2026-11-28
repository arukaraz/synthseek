import { useSyncExternalStore } from "react";

import { readMotionReduced, subscribeAccessibility } from "@modules/accessibility";

export function useMotionReduced(): boolean {
  return useSyncExternalStore(subscribeAccessibility, readMotionReduced, () => false);
}
