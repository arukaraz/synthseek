import { useEffect } from "react";

import { holdRequestListRefresh } from "./shared/requestListInvalidation";

export function useHoldRequestListRefresh(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    return holdRequestListRefresh();
  }, [active]);
}
