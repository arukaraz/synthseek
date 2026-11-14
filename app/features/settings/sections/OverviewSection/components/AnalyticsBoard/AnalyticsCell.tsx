import { BOARD_SIZE_COLS } from "@components/BoardGrid";

import { ANALYTICS_CELL_ROWS } from "./constants";
import { analyticsCell, cellVars } from "./styles";
import type { AnalyticsCellProps } from "./types";

export function AnalyticsCell({ device, size, height, children }: AnalyticsCellProps) {
  const span = { cols: BOARD_SIZE_COLS[device][size], rows: ANALYTICS_CELL_ROWS[device][height][size] };
  return (
    <div className={analyticsCell()} style={cellVars(span)}>
      {children}
    </div>
  );
}
