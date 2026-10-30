import type { BoardDevice } from "@components/BoardGrid";

export const ARRANGE_BOARD_WIDTH: Record<BoardDevice, number> = { wide: 1200, narrow: 390 };

export const ARRANGE_MIN_SCALE: Record<BoardDevice, number> = { wide: 0.41, narrow: 0.6 };

export const ARRANGE_MAX_SCALE = 0.8;

export const ARRANGE_BAR_PX = 28;
