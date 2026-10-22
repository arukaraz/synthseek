import { BOARD_SPANS } from "@components/BoardGrid";

import { analyticsCell, cellVars } from "./styles";
import type { AnalyticsCellProps } from "./types";

export function AnalyticsCell({ device, size, height, children }: AnalyticsCellProps) {
  return (
    <div className={analyticsCell()} style={cellVars(BOARD_SPANS[device][size][height])}>
      {children}
    </div>
  );
}
