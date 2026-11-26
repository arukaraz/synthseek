import { useEffect } from "react";

import { holdRequestListRows } from "./shared/requestListInvalidation";

export function useHoldRequestListRows(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    return holdRequestListRows();
  }, [active]);
}
