import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import type { BoardAppearance } from "@hooks/api/queries/board/types";

import { BOARD_COLUMNS, BOARD_TEXT_SCALE, BOARD_TYPE_STEPS_REM } from "./constants";
import { boardMetricsOf } from "./helpers";
import type { BoardDevice, BoardMetrics } from "./types";

export const boardGrid = cva(
  "grid auto-rows-[var(--board-row)] grid-cols-[repeat(var(--board-cols),minmax(0,1fr))] gap-[var(--board-gap)]"
);

function typeScaleVars(scale: number): CssVars {
  if (scale === 1) return {};
  return Object.fromEntries(
    Object.entries(BOARD_TYPE_STEPS_REM).map(([step, rem]) => [`--text-${step}`, `${rem * scale}rem`])
  );
}

export function boardGridVars(
  device: BoardDevice,
  appearance?: BoardAppearance,
  metrics: BoardMetrics = boardMetricsOf(appearance)
): CssVars {
  return {
    "--board-cols": String(BOARD_COLUMNS[device]),
    "--board-row": `${metrics.rowPx}px`,
    "--board-gap": `${metrics.gapPx}px`,
    ...(appearance ? typeScaleVars(BOARD_TEXT_SCALE[appearance.text]) : {}),
  };
}
