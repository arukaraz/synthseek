import type { ReactNode } from "react";

import type { BoardAppearance } from "@hooks/api/queries/board/types";

export type BoardDevice = "wide" | "narrow";

export type BoardHeight = "short" | "regular" | "tall";

export interface BoardSpan {
  cols: number;
  rows: number;
}

export interface BoardMetrics {
  rowPx: number;
  gapPx: number;
}

export interface BoardGridProps {
  device: BoardDevice;
  appearance?: BoardAppearance;
  children: ReactNode;
}
