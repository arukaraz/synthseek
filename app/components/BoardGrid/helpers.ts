import type { BoardAppearance } from "@hooks/api/queries/board/types";

import { BOARD_DENSITY_METRICS, BOARD_GAP_PX, BOARD_ROW_PX } from "./constants";
import type { BoardMetrics } from "./types";

export function boardMetricsOf(appearance?: BoardAppearance): BoardMetrics {
  return appearance ? BOARD_DENSITY_METRICS[appearance.density] : { rowPx: BOARD_ROW_PX, gapPx: BOARD_GAP_PX };
}
