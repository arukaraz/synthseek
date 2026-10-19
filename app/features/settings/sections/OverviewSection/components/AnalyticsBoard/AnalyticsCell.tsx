import { FAMILY_SPANS } from "@components/BoardGrid";

import { analyticsCell, cellVars } from "./styles";
import type { AnalyticsCellProps } from "./types";

export function AnalyticsCell({ device, size, children }: AnalyticsCellProps) {
  return (
    <div className={analyticsCell()} style={cellVars(FAMILY_SPANS[device][size])}>
      {children}
    </div>
  );
}
